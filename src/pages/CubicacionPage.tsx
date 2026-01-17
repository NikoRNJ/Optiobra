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
  RotateCcw,
  Info,
  CheckCircle,
  Save
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
    <Card className="border-none shadow-xl bg-white animate-fade-in-up relative overflow-hidden" padding="lg">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-success-500" />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-success-50 flex items-center justify-center border border-success-100">
          <CheckCircle className="w-5 h-5 text-success-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-surface-900 text-base">Cálculo Exitoso</h3>
          <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Normativa NCh 170</p>
        </div>
        <Button size="sm" className="rounded-full px-4 h-8 text-[11px] font-black uppercase tracking-wider shadow-sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
          Guardar
        </Button>
      </div>

      {/* Dimensiones - Compact Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {resultado.superficie && (
          <div className="bg-surface-50 p-3 rounded-2xl border border-surface-100">
            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">
              Superficie
            </p>
            <p className="text-xl font-bold font-numeric text-surface-900 leading-none">
              {formatWithUnit(resultado.superficie, 'm²')}
            </p>
          </div>
        )}
        {resultado.volumen && (
          <div className="bg-surface-50 p-3 rounded-2xl border border-surface-100">
            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">
              Volumen
            </p>
            <p className="text-xl font-bold font-numeric text-surface-900 leading-none">
              {formatWithUnit(resultado.volumen, 'm³')}
            </p>
          </div>
        )}
      </div>

      {/* Materiales */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-3 rounded-full bg-success-500" />
          <h4 className="font-black text-surface-400 text-[10px] uppercase tracking-[0.2em]">
            Dosificación Requerida
          </h4>
        </div>
        <div className="space-y-1.5">
          {resultado.materiales.map((material: MaterialCubicacion, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between bg-surface-50/50 px-4 py-3 rounded-xl border border-surface-100"
            >
              <span className="text-xs font-bold text-surface-700">{material.nombre}</span>
              <span className="font-bold font-numeric text-sm text-primary-700">
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
    <div className="p-4 lg:p-6 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="min-w-0">
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block">
            Ingeniería de Campo
          </span>
          <h1 className="text-2xl font-black text-surface-900 leading-none truncate">
            Cubicación de Materiales
          </h1>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 border border-primary-100">
          <Calculator className="w-5 h-5 text-primary-600" />
        </div>
      </div>

      {/* Selector de Calculadora - Modern Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          <h2 className="text-xs font-black text-surface-400 uppercase tracking-widest">
            Seleccionar Elemento
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {calculadoras.map((calc) => {
            const isActive = calculadoraActiva === calc.id;
            return (
              <button
                key={calc.id}
                onClick={() => cambiarCalculadora(calc.id)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-2xl transition-all border
                  ${isActive
                    ? 'bg-primary-500 text-white border-primary-400 shadow-lg shadow-primary-200 scale-105 z-10'
                    : 'bg-white text-surface-500 border-surface-100 hover:border-primary-200'
                  }
                `}
              >
                <calc.icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-white' : 'text-primary-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-tight leading-none text-center">{calc.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="h-4 w-1 bg-primary-500 rounded-full" />
            <h2 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">
              Parámetros: {calculadoraActual.label}
            </h2>
          </div>

        {/* Form */}
          <Card className="border-none shadow-sm h-fit bg-white/50 backdrop-blur-sm" padding="lg">
          <form onSubmit={handleSubmit(calcular)} className="space-y-6">
            <div className="space-y-4">
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
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-surface-100">
              <Button 
                 type="submit" 
                 fullWidth 
                 className="rounded-2xl font-black text-xs uppercase tracking-widest h-12 shadow-lg shadow-primary-200"
              >
                <Calculator className="w-4 h-4 mr-2" />
                GENERAR CÁLCULO
              </Button>
              <Button 
                 type="button" 
                 variant="outline" 
                 onClick={limpiar} 
                 size="icon"
                 className="rounded-2xl h-12 w-12 border-surface-200"
              >
                <RotateCcw className="w-5 h-5 text-surface-400" />
              </Button>
            </div>
          </form>
        </Card>
        </div>

        {/* Result Area */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="h-4 w-1 bg-success-500 rounded-full" />
            <h2 className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">
               Reporte de Dosificación
            </h2>
          </div>

          {resultado ? (
            <ResultadoCard resultado={resultado} />
          ) : (
            <Card className="border-2 border-dashed border-surface-200 bg-surface-50/50 rounded-3xl h-full min-h-[300px] flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-surface-100">
                  <Calculator className="w-10 h-10 text-surface-200" />
                </div>
                <h3 className="font-black text-surface-400 uppercase tracking-widest text-xs mb-2">Calculadora en Espera</h3>
                <p className="text-[11px] font-bold text-surface-400 max-w-[200px] leading-relaxed">
                  Ingrese las dimensiones requeridas para procesar el cómputo de materiales.
                </p>
              </div>
            </Card>
          )}

          {/* NCh Info */}
          <div className="flex items-start gap-4 p-5 rounded-3xl bg-surface-900 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <Info className="w-24 h-24" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-primary-400" />
            </div>
            <div className="relative z-10">
              <p className="font-black text-[10px] uppercase tracking-widest text-primary-400 mb-1">Nota Técnica NCh 170</p>
              <p className="text-[11px] font-medium text-surface-300 leading-relaxed">
                Los cálculos presentados siguen las directrices de la normativa Chilena vigente para la dosificación de hormigones y materiales de construcción. Use estos valores como referencia técnica para sus pedidos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CubicacionPage;
