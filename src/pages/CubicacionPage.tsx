/**
 * OptiObra - Página de Cubicación
 * Calculadora profesional para supervisores de obra
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Calculator,
  Layers,
  Box,
  Grid3X3,
  Columns,
  Square,
  Save,
  RotateCcw,
  CheckCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Select,
} from '@/components/ui';
import { toast } from '@/stores/uiStore';
import {
  calcularZapata,
  calcularRadier,
  calcularMuro,
  calcularLosa,
  calcularPilar,
  calcularViga,
  formatWithUnit,
  TIPOS_LADRILLO,
  MALLAS_ACMA,
} from '@/utils';
import type { GradoHormigon, ResultadoCubicacion, MaterialCubicacion } from '@/types';

type CalculadoraTipo = 'zapata' | 'radier' | 'muro' | 'losa' | 'pilar' | 'viga';

interface CalculadoraOption {
  id: CalculadoraTipo;
  label: string;
  icon: React.ElementType;
  description: string;
}

const calculadoras: CalculadoraOption[] = [
  { id: 'zapata', label: 'Zapata', icon: Box, description: 'Fundación' },
  { id: 'radier', label: 'Radier', icon: Grid3X3, description: 'Piso' },
  { id: 'muro', label: 'Muro', icon: Columns, description: 'Albañilería' },
  { id: 'losa', label: 'Losa', icon: Layers, description: 'Hormigón' },
  { id: 'pilar', label: 'Pilar', icon: Square, description: 'Columna' },
  { id: 'viga', label: 'Viga', icon: Columns, description: 'Cadena' },
];

const gradosHormigon = [
  { value: 'H20', label: 'H20 (20 MPa)' },
  { value: 'H25', label: 'H25 (25 MPa)' },
  { value: 'H30', label: 'H30 (30 MPa)' },
  { value: 'H35', label: 'H35 (35 MPa)' },
  { value: 'H40', label: 'H40 (40 MPa)' },
];

const tiposLadrillo = Object.entries(TIPOS_LADRILLO).map(([key, val]) => ({
  value: key,
  label: val.nombre,
}));

const tiposMalla = Object.entries(MALLAS_ACMA).map(([key, val]) => ({
  value: key,
  label: val.nombre,
}));

function ResultadoCard({ resultado }: { resultado: ResultadoCubicacion }) {
  return (
    <Card className="border-2 border-success-500 bg-success-50 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-success-200">
        <div className="w-12 h-12 rounded-xl bg-success-600 flex items-center justify-center shadow-lg">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-surface-900 text-lg">Resultado</h3>
          <p className="text-sm font-medium text-surface-600">Según NCh 170</p>
        </div>
        <Button size="sm" variant="success" leftIcon={<Save className="w-4 h-4" />}>
          Guardar
        </Button>
      </div>

      {/* Dimensiones */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {resultado.superficie && (
          <div className="bg-white p-4 rounded-xl border border-success-200">
            <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">
              Superficie
            </p>
            <p className="text-2xl font-black font-numeric text-surface-900">
              {formatWithUnit(resultado.superficie, 'm²')}
            </p>
          </div>
        )}
        {resultado.volumen && (
          <div className="bg-white p-4 rounded-xl border border-success-200">
            <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-1">
              Volumen
            </p>
            <p className="text-2xl font-black font-numeric text-surface-900">
              {formatWithUnit(resultado.volumen, 'm³')}
            </p>
          </div>
        )}
      </div>

      {/* Materiales */}
      <div>
        <h4 className="font-bold text-surface-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
          <Box className="w-4 h-4" />
          Materiales Necesarios
        </h4>
        <div className="space-y-2">
          {resultado.materiales.map((material: MaterialCubicacion, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-4 rounded-xl border border-success-200"
            >
              <span className="font-semibold text-surface-700">{material.nombre}</span>
              <span className="font-black font-numeric text-surface-900 bg-success-100 px-3 py-1 rounded-lg">
                {formatWithUnit(material.cantidad, material.unidad)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function CubicacionPage() {
  const [calculadoraActiva, setCalculadoraActiva] = useState<CalculadoraTipo>('zapata');
  const [resultado, setResultado] = useState<ResultadoCubicacion | null>(null);

  const { register, handleSubmit, reset } = useForm();

  const calcular = (data: Record<string, string>) => {
    try {
      let result: ResultadoCubicacion;

      switch (calculadoraActiva) {
        case 'zapata':
          result = calcularZapata({
            largo: parseFloat(data.largo),
            ancho: parseFloat(data.ancho),
            alto: parseFloat(data.alto),
            gradoHormigon: data.gradoHormigon as GradoHormigon,
            cantidad: parseInt(data.cantidad) || 1,
          });
          break;

        case 'radier':
          result = calcularRadier({
            largo: parseFloat(data.largo),
            ancho: parseFloat(data.ancho),
            espesor: parseFloat(data.espesor),
            gradoHormigon: data.gradoHormigon as GradoHormigon,
            tipoMalla: data.tipoMalla as keyof typeof MALLAS_ACMA,
          });
          break;

        case 'muro':
          result = calcularMuro({
            largo: parseFloat(data.largo),
            alto: parseFloat(data.alto),
            tipoLadrillo: data.tipoLadrillo as keyof typeof TIPOS_LADRILLO,
            conEstuco: data.conEstuco === 'si',
          });
          break;

        case 'losa':
          result = calcularLosa({
            largo: parseFloat(data.largo),
            ancho: parseFloat(data.ancho),
            espesor: parseFloat(data.espesor),
            gradoHormigon: data.gradoHormigon as GradoHormigon,
            diametroAcero: parseInt(data.diametroAcero) || 10,
            espaciamientoAcero: parseInt(data.espaciamientoAcero) || 15,
          });
          break;

        case 'pilar':
          result = calcularPilar({
            base: parseFloat(data.base),
            profundidad: parseFloat(data.profundidad),
            altura: parseFloat(data.altura),
            gradoHormigon: data.gradoHormigon as GradoHormigon,
            cantidad: parseInt(data.cantidad) || 1,
          });
          break;

        case 'viga':
          result = calcularViga({
            largo: parseFloat(data.largo),
            base: parseFloat(data.base),
            altura: parseFloat(data.alturaSeccion),
            gradoHormigon: data.gradoHormigon as GradoHormigon,
            cantidad: parseInt(data.cantidad) || 1,
          });
          break;

        default:
          throw new Error('Calculadora no implementada');
      }

      setResultado(result);
      toast.success('Cálculo completado');
    } catch (error) {
      toast.error('Error en el cálculo. Verifique los datos.');
      console.error(error);
    }
  };

  const limpiar = () => {
    reset();
    setResultado(null);
  };

  const cambiarCalculadora = (tipo: CalculadoraTipo) => {
    setCalculadoraActiva(tipo);
    setResultado(null);
    reset();
  };

  const calculadoraActual = calculadoras.find(c => c.id === calculadoraActiva)!;

  return (
    <div className="min-h-full px-5 py-4 pb-8">
      {/* Header */}
      <div className="bg-white border border-surface-200 rounded-2xl shadow-card mb-4">
        <div className="px-5 py-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-surface-900">Cubicación</h1>
              <p className="text-sm font-medium text-surface-600">
                Normativas NCh chilenas
              </p>
            </div>
          </div>

          {/* Calculator Selector */}
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {calculadoras.map((calc) => {
                const isActive = calculadoraActiva === calc.id;
                return (
                  <button
                    key={calc.id}
                    onClick={() => cambiarCalculadora(calc.id)}
                    className={`
                      flex-shrink-0 flex flex-col items-center justify-center
                      p-3 rounded-xl border-2 transition-all duration-150
                      min-w-[72px] press-effect
                      ${isActive
                        ? 'border-primary-600 bg-primary-50 shadow-sm'
                        : 'border-surface-200 bg-white hover:border-surface-300'
                      }
                    `}
                  >
                    <calc.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary-600' : 'text-surface-500'}`} />
                    <span className={`text-[10px] font-bold ${isActive ? 'text-primary-700' : 'text-surface-700'}`}>
                      {calc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Active Calculator Card */}
        <Card className="border-l-4 border-l-primary-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <calculadoraActual.icon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-surface-900">
                Calcular {calculadoraActual.label}
              </h3>
              <p className="text-sm text-surface-600">{calculadoraActual.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-surface-400" />
          </div>
        </Card>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit(calcular)} className="space-y-5">
            {/* ZAPATA */}
            {calculadoraActiva === 'zapata' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Largo (m)" type="number" step="0.01" placeholder="1.00" {...register('largo', { required: true })} required />
                  <Input label="Ancho (m)" type="number" step="0.01" placeholder="1.00" {...register('ancho', { required: true })} required />
                  <Input label="Alto (m)" type="number" step="0.01" placeholder="0.50" {...register('alto', { required: true })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Grado Hormigón" options={gradosHormigon} {...register('gradoHormigon', { required: true })} required />
                  <Input label="Cantidad" type="number" placeholder="1" defaultValue="1" {...register('cantidad')} />
                </div>
              </>
            )}

            {/* RADIER */}
            {calculadoraActiva === 'radier' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Largo (m)" type="number" step="0.01" placeholder="10.00" {...register('largo', { required: true })} required />
                  <Input label="Ancho (m)" type="number" step="0.01" placeholder="8.00" {...register('ancho', { required: true })} required />
                  <Input label="Espesor (cm)" type="number" step="1" placeholder="10" {...register('espesor', { required: true })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Grado Hormigón" options={gradosHormigon} {...register('gradoHormigon', { required: true })} required />
                  <Select label="Tipo de Malla" options={tiposMalla} {...register('tipoMalla', { required: true })} required />
                </div>
              </>
            )}

            {/* MURO */}
            {calculadoraActiva === 'muro' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Largo (m)" type="number" step="0.01" placeholder="5.00" {...register('largo', { required: true })} required />
                  <Input label="Alto (m)" type="number" step="0.01" placeholder="2.50" {...register('alto', { required: true })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Tipo de Ladrillo" options={tiposLadrillo} {...register('tipoLadrillo', { required: true })} required />
                  <Select label="Con Estuco" options={[{ value: 'no', label: 'Sin estuco' }, { value: 'si', label: 'Con estuco' }]} {...register('conEstuco')} />
                </div>
              </>
            )}

            {/* LOSA */}
            {calculadoraActiva === 'losa' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Largo (m)" type="number" step="0.01" placeholder="6.00" {...register('largo', { required: true })} required />
                  <Input label="Ancho (m)" type="number" step="0.01" placeholder="4.00" {...register('ancho', { required: true })} required />
                  <Input label="Espesor (cm)" type="number" step="1" placeholder="15" {...register('espesor', { required: true })} required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Select label="Grado Hormigón" options={gradosHormigon} {...register('gradoHormigon', { required: true })} required />
                  <Input label="Ø Acero (mm)" type="number" placeholder="10" defaultValue="10" {...register('diametroAcero')} />
                  <Input label="Espaciado (cm)" type="number" placeholder="15" defaultValue="15" {...register('espaciamientoAcero')} />
                </div>
              </>
            )}

            {/* PILAR */}
            {calculadoraActiva === 'pilar' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Base (cm)" type="number" step="1" placeholder="30" {...register('base', { required: true })} required />
                  <Input label="Profundidad (cm)" type="number" step="1" placeholder="30" {...register('profundidad', { required: true })} required />
                  <Input label="Altura (m)" type="number" step="0.01" placeholder="3.00" {...register('altura', { required: true })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Grado Hormigón" options={gradosHormigon} {...register('gradoHormigon', { required: true })} required />
                  <Input label="Cantidad" type="number" placeholder="1" defaultValue="1" {...register('cantidad')} />
                </div>
              </>
            )}

            {/* VIGA */}
            {calculadoraActiva === 'viga' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Largo (m)" type="number" step="0.01" placeholder="4.00" {...register('largo', { required: true })} required />
                  <Input label="Base (cm)" type="number" step="1" placeholder="20" {...register('base', { required: true })} required />
                  <Input label="Altura (cm)" type="number" step="1" placeholder="40" {...register('alturaSeccion', { required: true })} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Grado Hormigón" options={gradosHormigon} {...register('gradoHormigon', { required: true })} required />
                  <Input label="Cantidad" type="number" placeholder="1" defaultValue="1" {...register('cantidad')} />
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" fullWidth leftIcon={<Calculator className="w-5 h-5" />}>
                Calcular
              </Button>
              <Button type="button" variant="outline" onClick={limpiar} size="icon">
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Result */}
        {resultado ? (
          <ResultadoCard resultado={resultado} />
        ) : (
          <Card className="border-2 border-dashed border-surface-300">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-surface-400" />
              </div>
              <p className="font-bold text-surface-600">Sin resultados</p>
              <p className="text-sm text-surface-500 mt-1">
                Complete el formulario y presione Calcular
              </p>
            </div>
          </Card>
        )}

        {/* NCh Info */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-800 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Normativa NCh 170</p>
            <p className="text-sm text-white/70 mt-1 leading-relaxed">
              Dosificación oficial para hormigones en Chile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CubicacionPage;
