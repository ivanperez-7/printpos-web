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

import { useHeader } from '@/components/site-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { getDashboardData } from '@/api/dashboard';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

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
      <h2 className='text-2xl'>Dashboard</h2>

      <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='@container/card'>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              $1,250.00
            </CardTitle>
            <CardAction>
              <Badge variant='outline'>
                <TrendingUp />
                +12.5%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className='flex-col items-start gap-1.5 text-sm'>
            <div className='line-clamp-1 flex gap-2 font-medium'>
              Trending up this month <TrendingUp className='size-4' />
            </div>
            <div className='text-muted-foreground'>Visitors for the last 6 months</div>
          </CardFooter>
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
            <CardTitle>Productos por Categoría</CardTitle>
          </CardHeader>
          <CardContent className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={categoriasChart}>
                <XAxis dataKey='categoria' />
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
                <XAxis dataKey='fecha' />
                <YAxis />
                <Tooltip />
                <Line type='monotone' dataKey='lotes' stroke='#10b981' strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className='grid lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Clientes por Tipo (Física vs Moral)</CardTitle>
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
            <CardTitle>Productos con Bajo Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <table className='w-full text-sm'>
              <thead className='text-left border-b'>
                <tr>
                  <th className='py-2'>Producto</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {productosBajos.map((p, i) => (
                  <tr key={i} className='border-b last:border-none'>
                    <td className='py-2'>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td className='font-semibold text-red-500'>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
