import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { crearEntrega } from '../services/entregaService';

const schema = z.object({
  cliente: z.enum(['CD Walmart', 'CD Sodimac']),
  fechaEntrega: z.string().nonempty({ message: 'La fecha de entrega es requerida' }),
  factura: z.instanceof(FileList).optional(),
  guiaDespacho: z.instanceof(FileList).optional(),
  fichaEntrega: z.instanceof(FileList).optional(),
  packingList: z.instanceof(FileList).optional(),
  documentoTimbrado: z.instanceof(FileList).optional(),
  observaciones: z.string().optional(),
});

type RegistroEntregaForm = z.infer<typeof schema>;

const RegistroEntrega: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegistroEntregaForm>({
    resolver: zodResolver(schema),
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: RegistroEntregaForm) => {
    try {
      await crearEntrega(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al crear la entrega:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Registro de Entrega</h1>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="leading-loose">Cliente</label>
                  <select
                    {...register('cliente')}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  >
                    <option value="CD Walmart">CD Walmart</option>
                    <option value="CD Sodimac">CD Sodimac</option>
                  </select>
                  {errors.cliente && <p className="text-red-500 text-sm mt-1">{errors.cliente.message}</p>}
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Fecha de Entrega</label>
                  <input
                    type="date"
                    {...register('fechaEntrega')}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                  {errors.fechaEntrega && <p className="text-red-500 text-sm mt-1">{errors.fechaEntrega.message}</p>}
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Factura o Guía de Despacho</label>
                  <input
                    type="file"
                    {...register('factura')}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Ficha de Entrega</label>
                  <input
                    type="file"
                    {...register('fichaEntrega')}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Packing List</label>
                  <input
                    type="file"
                    {...register('packingList')}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Documento Timbrado de Entrega</label>
                  <input
                    type="file"
                    {...register('documentoTimbrado')}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Observaciones</label>
                  <textarea
                    {...register('observaciones')}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    rows={4}
                  ></textarea>
                </div>
              </div>
              <div className="pt-4 flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                >
                  Crear Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroEntrega;