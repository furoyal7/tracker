import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Check, 
  X, 
  Eye, 
  ExternalLink, 
  Filter, 
  RotateCcw, 
  ShieldCheck, 
  User, 
  ArrowRight,
  Search,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function AdminExchangeDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [orders, setOrders] = useState<ExchangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('Unauthorized access');
      router.push('/');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response: any = await exchangeService.getAdminOrders();
      setOrders(response.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'confirm' | 'reject' | 'complete') => {
    setProcessingId(id);
    try {
      if (action === 'confirm') await exchangeService.confirmOrder(id);
      else if (action === 'reject') await exchangeService.rejectOrder(id);
      else if (action === 'complete') await exchangeService.completeOrder(id);
      
      toast.success(`Order ${action}ed successfully`);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' };
      case 'proof_uploaded': return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Uploaded' };
      case 'ready_for_confirmation': return { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'L2 Verified' };
      case 'under_review': return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Review' };
      case 'confirmed': return { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Confirmed' };
      case 'rejected': return { color: 'text-rose-600', bg: 'bg-rose-100', label: 'Rejected' };
      case 'completed': return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Complete' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-100', label: status };
    }
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <MainLayout>
      <div className="flex flex-col space-y-8 pb-10">
        
        {/* Verification Centre Header */}
        <div className="flex flex-col space-y-1.5 px-1">
          <div className="flex items-center space-x-2">
            <Fingerprint size={14} className="text-blue-600" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Verification Hub</h3>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Audit Queue</h1>
            <button onClick={fetchOrders} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-50 text-slate-400 active:scale-95 transition-all">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'proof_uploaded', label: 'Unchecked' },
            { id: 'under_review', label: 'Flagged' },
            { id: 'confirmed', label: 'Approved' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                "whitespace-nowrap px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95",
                filter === item.id 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "bg-white text-slate-400 border border-slate-50 shadow-sm"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Audit Cards */}
        <div className="grid gap-6">
          {loading ? (
            <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Synchronizing Audit Records...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 border border-slate-50 shadow-sm text-center space-y-4">
               <ShieldCheck size={40} className="text-slate-100 mx-auto" />
               <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">All sessions cleared</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              return (
                <div key={order.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-[0_4px_30px_-1px_rgba(37,99,235,0.02)] space-y-6 animate-ingress">
                  
                  {/* Row 1: Ref & Customer */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                       <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                         <User size={18} strokeWidth={2.5} />
                       </div>
                       <div className="space-y-0.5">
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">#{order.referenceCode}</h4>
                          <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{order.user?.email}</p>
                       </div>
                    </div>
                    <div className={cn("px-3 py-1 rounded-full", statusCfg.bg)}>
                       <span className={cn("text-[7px] font-black uppercase tracking-[0.15em]", statusCfg.color)}>{statusCfg.label}</span>
                    </div>
                  </div>

                  {/* Row 2: Exchange Data */}
                  <div className="flex items-center justify-between py-4 border-y border-slate-50">
                    <div className="space-y-1">
                       <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Yielding</p>
                       <p className="text-sm font-black text-slate-900 leading-none">{order.amount} <span className="opacity-30">{order.fromCurrency}</span></p>
                    </div>
                    <ArrowRight size={14} className="text-slate-100" />
                    <div className="text-right space-y-1">
                       <p className="text-[7px] font-black text-blue-500 uppercase tracking-widest leading-none">Receiving</p>
                       <p className="text-sm font-black text-blue-600 leading-none">{order.expectedReceiveAmount.toLocaleString()} <span className="opacity-30">{order.toCurrency}</span></p>
                    </div>
                  </div>

                  {/* Row 3: Proof & Actions */}
                  <div className="flex items-center justify-between">
                     {order.proof ? (
                       <button 
                         onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${order.proof?.imageUrl}`, '_blank')}
                         className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 group active:scale-95 transition-all"
                       >
                          <div className="h-6 w-6 rounded-lg overflow-hidden border border-slate-200">
                             <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${order.proof?.imageUrl}`} className="h-full w-full object-cover" />
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-600 transition-colors">Artifact</span>
                          <ExternalLink size={10} className="text-slate-300" />
                       </button>
                     ) : (
                       <div className="flex items-center space-x-2 text-slate-200">
                          <Search size={14} />
                          <span className="text-[8px] font-black uppercase tracking-widest">No Proof Artifact</span>
                       </div>
                     )}

                     <div className="flex items-center space-x-2">
                        {['proof_uploaded', 'under_review', 'ready_for_confirmation'].includes(order.status) && (
                          <div className="flex items-center space-x-1.5">
                            <button 
                              onClick={() => handleAction(order.id, 'confirm')}
                              disabled={processingId === order.id}
                              className="h-10 w-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-2xl active:scale-90 transition-all border border-emerald-100/50"
                            >
                              <Check size={18} strokeWidth={3} />
                            </button>
                            <button 
                              onClick={() => handleAction(order.id, 'reject')}
                              disabled={processingId === order.id}
                              className="h-10 w-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-2xl active:scale-90 transition-all border border-rose-100/50"
                            >
                              <X size={18} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                        {order.status === 'confirmed' && (
                          <button 
                            onClick={() => handleAction(order.id, 'complete')}
                            disabled={processingId === order.id}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button 
                          onClick={() => router.push(`/exchange/${order.id}`)}
                          className="p-3 text-slate-300 hover:text-slate-900 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                     </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}
  );
}
