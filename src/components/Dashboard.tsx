import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getEntregas } from '../services/entregaService';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user, userRole, logout, isOnline } = useAuth();
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState<any[]>([]);
  const [totalMes, setTotalMes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      loadEntregas();
    }
  }, [user, navigate, isOnline]);

  const loadEntregas = async () => {
    if (!isOnline) {
      setError('No hay conexión a internet. Los datos pueden no estar actualizados.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const entregasData = await getEntregas();
      setEntregas(entregasData);
      calcularTotalMes(entregasData);
    } catch (error) {
      console.error('Error al cargar entregas:', error);
      setError('Error al cargar las entregas. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalMes = (entregasData: any[]) => {
    const mesActual = new Date().getMonth();
    const entregasMes = entregasData.filter(entrega => new Date(entrega.fechaEntrega).getMonth() === mesActual);
    const total = entregasMes.length * 25000 * 1.19; // 25000 + IVA
    setTotalMes(total);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Sistema de Registro de Entregas</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
          
          {!isOnline && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-yellow-700">
                Modo sin conexión. Los datos pueden no estar actualizados.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loading ? (
            <p>Cargando...</p>
          ) : (
            <>
              {userRole === 'admin' && (
                <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Total del mes actual</h3>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">
                      ${totalMes.toLocaleString('es-CL')} CLP
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Entregas recientes</h3>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {entregas.map((entrega) => (
                      <li key={entrega.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {entrega.cliente} - {format(new Date(entrega.fechaEntrega), 'dd/MM/yyyy')}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {entrega.estado || 'Completada'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {entrega.tipoEntrega || 'Entrega estándar'}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Valor: ${(25000 * 1.19).toLocaleString('es-CL')} CLP
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;