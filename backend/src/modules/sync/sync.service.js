import prisma from '../../lib/prisma.js';

export const processBatchSync = async (userId, actions) => {
  if (!Array.isArray(actions) || actions.length === 0) {
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  // Process sequentially to handle dependent actions and avoid complex transaction deadlocks
  // The user wants a DB transaction, we can wrap each action or wrap everything. 
  // It's safer to wrap the whole batch if they want atomicity, but offline actions might have some 
  // valid and some invalid (e.g. duplicate).
  // The user rule: "Use transaction (DB transaction)... Ignore duplicates"
  // Let's use a single Prisma transaction for atomicity. If one completely fails, all rollback.
  // Wait, if one is invalid payload, rolling back all might be bad for offline sync. 
  // But rule says: "Use transaction (DB transaction)". Let's wrap the loop in one.

  try {
    await prisma.$transaction(async (tx) => {
      for (const action of actions) {
        try {
          const { action_type, entity, payload, client_id } = action;
          
          // Check if this specific action has already been synced using client_id
          const existingSync = await tx.offlineAction.findFirst({
            where: { userId, payload: { equals: { client_id } } }
          });

          if (existingSync && existingSync.status === 'synced') {
            // Already synced, skip to ignore duplicate
            processed++;
            continue;
          }

          // Handle the entity action (assuming 'transaction' for now)
          if (entity === 'transaction') {
            if (action_type === 'create') {
              const { id, amount, ...rest } = payload;
              
              // Idempotency check on the actual transaction ID
              if (id) {
                const existingTx = await tx.transaction.findUnique({ where: { id } });
                if (!existingTx) {
                  await tx.transaction.create({
                    data: {
                      ...rest,
                      id,
                      amount: parseFloat(amount),
                      userId
                    }
                  });
                }
              } else {
                await tx.transaction.create({
                  data: {
                    ...rest,
                    amount: parseFloat(amount),
                    userId
                  }
                });
              }
            } else if (action_type === 'delete') {
              const { id } = payload;
              if (id) {
                const existingTx = await tx.transaction.findUnique({ where: { id } });
                if (existingTx) {
                  await tx.transaction.delete({ where: { id } });
                }
              }
            }
          }

          // Log the action to the DB
          await tx.offlineAction.create({
            data: {
              actionType: action_type,
              entity,
              payload,
              status: 'synced',
              userId
            }
          });

          processed++;
        } catch (actionError) {
          // Log failed action
          await tx.offlineAction.create({
            data: {
              actionType: action.action_type || 'unknown',
              entity: action.entity || 'unknown',
              payload: action.payload || {},
              status: 'failed',
              userId
            }
          });
          failed++;
        }
      }
    });

    return { processed, failed };
  } catch (error) {
    throw error;
  }
};
