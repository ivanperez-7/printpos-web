import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DataTable } from '@/components/data-table';
import { useHeader } from '@/components/site-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { getDashboardData } from '@/api/dashboard';

const lowStockColumns = [
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
  },
  {
    accessorKey: 'categoria__nombre',
    header: 'Categoría',
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
];

export const Route = createFileRoute('/_app/dashboard')({
  component: RouteComponent,
  loader: getDashboardData,
});

export default function RouteComponent() {
  const { stats, categoriasChart, entradasChart, productosBajos, clientesChart } =
    Route.useLoaderData();
  const { setContent } = useHeader();

  const colors = ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#a855f7'];

  useEffect(() => {
    setContent(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
    return () => setContent(null);
  }, []);

  return (
    <div className='space-y-4'>
      <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className='text-3xl font-semibold'>{stats.productos}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lotes</CardTitle>
          </CardHeader>
          <CardContent className='text-3xl font-semibold'>{stats.lotes}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proveedores</CardTitle>
          </CardHeader>
          <CardContent className='text-3xl font-semibold'>{stats.proveedores}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
          </CardHeader>
          <CardContent className='text-3xl font-semibold'>{stats.clientes}</CardContent>
        </Card>
      </div>

      <div className='grid lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Productos por categoría</CardTitle>
          </CardHeader>
          <CardContent className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={categoriasChart}>
                <XAxis dataKey='nombre' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='cantidad' fill='#3b82f6' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entradas en los últimos 30 días</CardTitle>
          </CardHeader>
          <CardContent className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={entradasChart}>
                <XAxis dataKey='fecha_creado' />
                <YAxis />
                <Tooltip />
                <Line type='monotone' dataKey='total' stroke='#10b981' strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className='grid lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Clientes por tipo (física vs moral)</CardTitle>
          </CardHeader>
          <CardContent className='h-[300px] flex justify-center'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie data={clientesChart} dataKey='cantidad' nameKey='tipo' outerRadius={110} label>
                  {clientesChart.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos con bajo inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable transparent data={productosBajos} columns={lowStockColumns} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
