/**
 * OptiObra - Página de Horas Laborales (HLA)
 * Listado y gestión de registros de horas trabajadas
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Clock, 
  Plus, 
  Search,
  Building2,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { 
  Card, 
  CardContent,
  Button, 
  Select,
  Badge,
  EmptyState,
  Input
} from '@/components/ui';
import { useObraStore, useHoraStore, useTrabajadorStore } from '@/stores';
import { formatDate } from '@/utils';
import type { RegistroHora } from '@/types';

const TIPO_LABELS: Record<string, string> = {
  normal: 'Normal',
  extra: 'Extra',
  nocturna: 'Nocturna',
  festivo: 'Festivo',
};

const TIPO_COLORS: Record<string, string> = {
  normal: 'bg-blue-100 text-blue-800',
  extra: 'bg-orange-100 text-orange-800',
  nocturna: 'bg-purple-100 text-purple-800',
  festivo: 'bg-red-100 text-red-800',
};

export function HorasPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const obraIdParam = searchParams.get('obraId');
  
  const { obras, cargarObras } = useObraStore();
  const { trabajadores, cargarTrabajadores } = useTrabajadorStore();
  const { 
    registrosHora, 
    isLoading,
    cargarRegistros,
    filtroTipo,
    filtroAprobado,
    setFiltroTipo,
    setFiltroAprobado,
    registrosFiltrados,
    getTotalHoras,
    aprobarRegistro
  } = useHoraStore();
  
  const [filtroObra, setFiltroObra] = useState<string>(obraIdParam || '');
  const [filtroTrabajador, setFiltroTrabajador] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarObras();
  }, []);

  useEffect(() => {
    if (filtroObra) {
      cargarRegistros(filtroObra);
      cargarTrabajadores(filtroObra);
    }
  }, [filtroObra]);

  useEffect(() => {
    if (obraIdParam) {
      setFiltroObra(obraIdParam);
    }
  }, [obraIdParam]);

  const getObraNombre = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    return obra?.nombre || 'Sin obra';
  };

  const getTrabajadorNombre = (trabajadorId: string) => {
    const trabajador = trabajadores.find(t => t.id === trabajadorId);
    return trabajador?.nombreCompleto || 'Desconocido';
  };

  // Filtrar registros adicionales por trabajador y búsqueda
  const registrosConFiltrosAdicionales = registrosFiltrados().filter(registro => {
    const matchTrabajador = !filtroTrabajador || registro.trabajadorId === filtroTrabajador;
    const matchBusqueda = !busqueda || 
      registro.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      getTrabajadorNombre(registro.trabajadorId).toLowerCase().includes(busqueda.toLowerCase());
    return matchTrabajador && matchBusqueda;
  });

  const handleAprobar = async (id: string) => {
    try {
      await aprobarRegistro(id, 'Admin'); // En producción, usar el usuario actual
      await cargarRegistros(filtroObra);
    } catch (error) {
      console.error('Error aprobando registro:', error);
    }
  };

  // Calcular estadísticas
  const totalHoras = getTotalHoras();
  const pendientesAprobacion = registrosHora.filter(r => !r.aprobado).length;
  const horasAprobadas = registrosHora.filter(r => r.aprobado).reduce((sum, r) => sum + r.horasTotales, 0);

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-primary-500" />
            Horas Laborales (HLA)
          </h1>
          <p className="text-surface-600 mt-1">
            Gestiona el registro de horas trabajadas
          </p>
        </div>
        <Button 
          onClick={() => navigate(`/horas/nueva${filtroObra ? `?obraId=${filtroObra}` : ''}`)}
          disabled={!filtroObra}
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Horas
        </Button>
      </div>

      {/* Estadísticas */}
      {filtroObra && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-surface-600">Total Horas</p>
                  <p className="text-2xl font-bold text-surface-900">
                    {totalHoras.toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-surface-600">Horas Aprobadas</p>
                  <p className="text-2xl font-bold text-surface-900">
                    {horasAprobadas.toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <XCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-surface-600">Pendientes</p>
                  <p className="text-2xl font-bold text-surface-900">
                    {pendientesAprobacion}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Obra */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Obra
              </label>
              <Select
                value={filtroObra}
                onChange={(e) => setFiltroObra(e.target.value)}
              >
                <option value="">Todas las obras</option>
                {obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nombre}
                  </option>
                ))}
              </Select>
            </div>

            {/* Trabajador */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Trabajador
              </label>
              <Select
                value={filtroTrabajador}
                onChange={(e) => setFiltroTrabajador(e.target.value)}
                disabled={!filtroObra}
              >
                <option value="">Todos los trabajadores</option>
                {trabajadores.map((trabajador) => (
                  <option key={trabajador.id} value={trabajador.id}>
                    {trabajador.nombreCompleto}
                  </option>
                ))}
              </Select>
            </div>

            {/* Tipo de Hora */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Tipo
              </label>
              <Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
              >
                <option value="todos">Todos los tipos</option>
                <option value="normal">Normal</option>
                <option value="extra">Extra</option>
                <option value="nocturna">Nocturna</option>
                <option value="festivo">Festivo</option>
              </Select>
            </div>

            {/* Estado Aprobación */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Aprobación
              </label>
              <Select
                value={filtroAprobado === 'todos' ? 'todos' : filtroAprobado ? 'true' : 'false'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFiltroAprobado(value === 'todos' ? 'todos' : value === 'true');
                }}
              >
                <option value="todos">Todas</option>
                <option value="true">Aprobadas</option>
                <option value="false">Pendientes</option>
              </Select>
            </div>

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Registros */}
      {!filtroObra ? (
        <EmptyState
          icon={Building2}
          title="Selecciona una obra"
          description="Para ver los registros de horas, primero selecciona una obra"
        />
      ) : isLoading ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-surface-400 mx-auto mb-4 animate-spin" />
          <p className="text-surface-600">Cargando registros...</p>
        </div>
      ) : registrosConFiltrosAdicionales.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No hay registros de horas"
          description="Aún no hay registros de horas para esta obra"
          action={
            <Button onClick={() => navigate(`/horas/nueva?obraId=${filtroObra}`)}>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Horas
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {registrosConFiltrosAdicionales.map((registro) => (
            <Card 
              key={registro.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/horas/${registro.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-surface-900">
                        {getTrabajadorNombre(registro.trabajadorId)}
                      </h3>
                      <Badge className={TIPO_COLORS[registro.tipo]}>
                        {TIPO_LABELS[registro.tipo]}
                      </Badge>
                      {registro.aprobado ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aprobado
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-surface-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(registro.fecha)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {registro.horaInicio} - {registro.horaFin}
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-surface-900">
                        <Clock className="w-4 h-4" />
                        {registro.horasTotales.toFixed(2)} hrs
                      </div>
                      {registro.descripcion && (
                        <div className="col-span-2 sm:col-span-1 text-surface-500 truncate">
                          {registro.descripcion}
                        </div>
                      )}
                    </div>

                    {!registro.aprobado && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAprobar(registro.id!);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-surface-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
