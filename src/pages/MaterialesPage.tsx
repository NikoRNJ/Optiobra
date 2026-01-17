/**
 * OptiObra - Página de Materiales
 * Gestión de inventario por obra
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Package,
    Plus,
    Search,
    Building2,
    AlertTriangle,
} from 'lucide-react';
import {
    Card,
    Button,
    Input,
    Select,
    Badge,
    EmptyState,
    Modal
} from '@/components/ui';
import { useObraStore, useMaterialStore } from '@/stores';
import { toast } from '@/stores/uiStore';
import type { Material, UnidadMedida } from '@/types';

const CATEGORIAS = [
    'Hormigón',
    'Acero',
    'Madera',
    'Agregados',
    'Cemento',
    'Eléctrico',
    'Gasfitería',
    'Terminaciones',
    'Herramientas',
    'Otros',
];

const UNIDADES: { value: UnidadMedida; label: string }[] = [
    { value: 'unidad', label: 'Unidad' },
    { value: 'kg', label: 'Kilogramos' },
    { value: 'ton', label: 'Toneladas' },
    { value: 'm', label: 'Metros' },
    { value: 'm2', label: 'Metros²' },
    { value: 'm3', label: 'Metros³' },
    { value: 'lt', label: 'Litros' },
    { value: 'saco', label: 'Sacos' },
    { value: 'bolsa', label: 'Bolsas' },
    { value: 'rollo', label: 'Rollos' },
    { value: 'plancha', label: 'Planchas' },
    { value: 'caja', label: 'Cajas' },
];

function MaterialCard({
    material,
    onAgregarStock,
    onUsarStock
}: {
    material: Material;
    onAgregarStock: () => void;
    onUsarStock: () => void;
}) {
    const porcentajeStock = material.cantidadRequerida > 0
        ? (material.cantidadEnStock / material.cantidadRequerida) * 100
        : 100;

    const stockBajo = porcentajeStock < 20;

    return (
        <Card className={`hover:border-primary-300 transition-all border-l-4 ${stockBajo ? 'border-l-error-500' : 'border-l-success-500'} overflow-hidden shadow-sm`} padding="none">
            <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none">
                                {material.categoria}
                            </span>
                            {stockBajo && (
                                <Badge className="bg-error-50 text-error-600 border-none text-[8px] font-black uppercase tracking-tighter px-1 py-0 flex items-center gap-0.5">
                                   <AlertTriangle className="w-2.5 h-2.5" /> CRÍTICO
                                </Badge>
                            )}
                        </div>
                        <h3 className="font-black text-surface-900 truncate uppercase tracking-tight text-sm">
                            {material.nombre}
                        </h3>
                    </div>
                </div>

                {/* Stock Info Industrial */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="text-left">
                        <p className="text-[9px] font-black text-surface-400 uppercase tracking-tighter mb-1">Requerido</p>
                        <p className="text-sm font-black font-numeric text-surface-900 leading-none">
                            {material.cantidadRequerida} <span className="text-[9px] font-bold text-surface-400">{material.unidad}</span>
                        </p>
                    </div>
                    <div className="text-left border-l border-surface-100 pl-3">
                        <p className="text-[9px] font-black text-surface-400 uppercase tracking-tighter mb-1">Disponible</p>
                        <p className={`text-sm font-black font-numeric leading-none ${stockBajo ? 'text-error-600' : 'text-success-600'}`}>
                            {material.cantidadEnStock} <span className="text-[9px] font-bold text-surface-400">{material.unidad}</span>
                        </p>
                    </div>
                    <div className="text-left border-l border-surface-100 pl-3">
                        <p className="text-[9px] font-black text-surface-400 uppercase tracking-tighter mb-1">Consumo</p>
                        <p className="text-sm font-black font-numeric text-primary-600 leading-none">
                            {material.cantidadUtilizada} <span className="text-[9px] font-bold text-surface-400">{material.unidad}</span>
                        </p>
                    </div>
                </div>

                {/* Progress Bar High Contrast */}
                <div className="space-y-1 mb-5">
                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mb-1">
                      <span className="text-surface-400">Estado de Acopio</span>
                      <span className={stockBajo ? 'text-error-600' : 'text-success-600'}>{Math.round(porcentajeStock)}%</span>
                   </div>
                   <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                       <div
                           className={`h-full rounded-full transition-all duration-500 shadow-sm ${stockBajo ? 'bg-error-500 animate-pulse' : 'bg-success-500'}`}
                           style={{ width: `${Math.min(porcentajeStock, 100)}%` }}
                       />
                   </div>
                </div>

                {/* Actions Industrial */}
                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        className="bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex-1 h-9 shadow-md shadow-primary-100"
                        onClick={onAgregarStock}
                    >
                        + ABASTECER
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-surface-200 font-black text-[10px] uppercase tracking-widest flex-1 h-9"
                        onClick={onUsarStock}
                    >
                        - DESPACHAR
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export function MaterialesPage() {
    const [searchParams] = useSearchParams();
    const obraIdParam = searchParams.get('obraId');

    const { obras, cargarObras } = useObraStore();
    const {
        materiales,
        cargarMateriales,
        crearMaterial,
        actualizarStock,
        isLoading
    } = useMaterialStore();

    const [obraSeleccionada, setObraSeleccionada] = useState<string>(obraIdParam || '');
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [modalNuevo, setModalNuevo] = useState(false);
    const [modalStock, setModalStock] = useState<{ material: Material; tipo: 'agregar' | 'usar' } | null>(null);
    const [cantidadStock, setCantidadStock] = useState('');

    // Form nuevo material
    const [nuevoMaterial, setNuevoMaterial] = useState({
        nombre: '',
        categoria: '',
        unidad: 'unidad' as UnidadMedida,
        cantidadRequerida: 0,
        cantidadEnStock: 0,
    });

    useEffect(() => {
        cargarObras();
    }, [cargarObras]);

    // Pre-seleccionar obra si viene de URL
    useEffect(() => {
        if (obraIdParam && obras.length > 0) {
            setObraSeleccionada(obraIdParam);
        }
    }, [obraIdParam, obras]);

    useEffect(() => {
        if (obraSeleccionada) {
            cargarMateriales(obraSeleccionada);
        }
    }, [obraSeleccionada, cargarMateriales]);

    const materialesFiltrados = materiales.filter(m => {
        if (busqueda && !m.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
            return false;
        }
        if (categoriaFiltro && m.categoria !== categoriaFiltro) {
            return false;
        }
        return true;
    });

    const handleCrearMaterial = async () => {
        if (!obraSeleccionada || !nuevoMaterial.nombre || !nuevoMaterial.categoria) {
            toast.error('Complete todos los campos requeridos');
            return;
        }

        try {
            await crearMaterial({
                ...nuevoMaterial,
                obraId: obraSeleccionada,
                cantidadUtilizada: 0,
            });
            toast.success('Material creado correctamente');
            setModalNuevo(false);
            setNuevoMaterial({
                nombre: '',
                categoria: '',
                unidad: 'unidad',
                cantidadRequerida: 0,
                cantidadEnStock: 0,
            });
        } catch {
            toast.error('Error al crear material');
        }
    };

    const handleActualizarStock = async () => {
        if (!modalStock || !cantidadStock) return;

        try {
            await actualizarStock(
                modalStock.material.id!,
                parseFloat(cantidadStock),
                modalStock.tipo
            );
            toast.success(
                modalStock.tipo === 'agregar'
                    ? 'Stock actualizado'
                    : 'Material utilizado registrado'
            );
            setModalStock(null);
            setCantidadStock('');
            cargarMateriales(obraSeleccionada);
        } catch {
            toast.error('Error al actualizar stock');
        }
    };

    return (
        <div className="min-h-full px-4 py-6 space-y-6">
            {/* Header Industrial Premium */}
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                    <div className="min-w-0">
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1 block">
                           Control de Inventario
                        </span>
                        <h1 className="text-3xl font-black text-surface-900 leading-none truncate">
                           Ficha de Materiales
                        </h1>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center border border-primary-100 flex-shrink-0">
                        <Package className="w-6 h-6 text-primary-600" />
                    </div>
                </div>

                <div className="bg-white p-2 rounded-3xl border border-surface-100 shadow-sm">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       <Select
                           options={[
                               { value: '', label: 'Seleccionar Frente de Obra' },
                               ...obras.map(o => ({ value: o.id!, label: o.nombre })),
                           ]}
                           value={obraSeleccionada}
                           onChange={(e) => setObraSeleccionada(e.target.value)}
                           className="border-none bg-surface-50 rounded-2xl h-12 font-bold text-xs"
                       />
                       {obraSeleccionada && (
                           <Button
                               onClick={() => setModalNuevo(true)}
                               className="rounded-2xl font-black text-xs uppercase tracking-widest h-12 shadow-lg shadow-primary-200"
                           >
                               <Plus className="w-4 h-4 mr-2" />
                               NUEVO INSUMO
                           </Button>
                       )}
                   </div>
                </div>
            </div>

            {!obraSeleccionada ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-surface-200">
                    <div className="w-20 h-20 rounded-full bg-surface-50 flex items-center justify-center mb-6 shadow-sm">
                       <Building2 className="w-10 h-10 text-surface-200" />
                    </div>
                    <h2 className="text-xs font-black text-surface-400 uppercase tracking-widest mb-2">Frente de Obra No Seleccionado</h2>
                    <p className="text-[11px] font-bold text-surface-400 max-w-[250px] text-center leading-relaxed">
                        Seleccione un proyecto activo para visualizar el despliegue de materiales y stock disponible.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Filtros Modernos */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
                            <input
                                placeholder="Buscar en bodega..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-surface-100 rounded-2xl text-xs font-bold text-surface-700 placeholder:text-surface-300 focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
                            />
                        </div>
                        <Select
                            options={[
                                { value: '', label: 'Categorías' },
                                ...CATEGORIAS.map(c => ({ value: c, label: c })),
                            ]}
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                            className="w-1/3 sm:w-1/4 border-none bg-white rounded-2xl h-[42px] shadow-sm"
                        />
                    </div>

                    {/* Materials List */}
                    {materialesFiltrados.length === 0 ? (
                        <EmptyState
                            icon={<Package className="w-16 h-16 text-surface-100" />}
                            title="BODEGA VACÍA"
                            description="No se han registrado insumos para este frente de obra."
                            action={{
                                label: 'ALTA DE MATERIAL',
                                onClick: () => setModalNuevo(true),
                            }}
                            className="bg-white border-2 border-dashed border-surface-200 rounded-3xl py-20"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {materialesFiltrados.map(material => (
                                <MaterialCard
                                    key={material.id}
                                    material={material}
                                    onAgregarStock={() => setModalStock({ material, tipo: 'agregar' })}
                                    onUsarStock={() => setModalStock({ material, tipo: 'usar' })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal Nuevo Material */}
            <Modal
                isOpen={modalNuevo}
                onClose={() => setModalNuevo(false)}
                title="REGISTRO DE INSUMO"
                variant="sheet"
            >
                <div className="space-y-4 pt-2">
                    <Input
                        label="Descripción del Material"
                        placeholder="Ej: Cemento Polpaico Especial"
                        value={nuevoMaterial.nombre}
                        onChange={(e) => setNuevoMaterial(prev => ({ ...prev, nombre: e.target.value }))}
                        required
                        className="bg-surface-50"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Select
                            label="Categoría"
                            value={nuevoMaterial.categoria}
                            onChange={(e) => setNuevoMaterial(prev => ({ ...prev, categoria: e.target.value }))}
                            options={[
                                { value: '', label: 'Tipo...' },
                                ...CATEGORIAS.map(c => ({ value: c, label: c })),
                            ]}
                            required
                        />
                        <Select
                            label="Unidad"
                            value={nuevoMaterial.unidad}
                            onChange={(e) => setNuevoMaterial(prev => ({ ...prev, unidad: e.target.value as UnidadMedida }))}
                            options={UNIDADES}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Requerido (Meta)"
                            type="number"
                            value={nuevoMaterial.cantidadRequerida || ''}
                            onChange={(e) => setNuevoMaterial(prev => ({ ...prev, cantidadRequerida: parseFloat(e.target.value) || 0 }))}
                            className="bg-surface-50 font-numeric"
                        />
                        <Input
                            label="Acopio Inicial"
                            type="number"
                            value={nuevoMaterial.cantidadEnStock || ''}
                            onChange={(e) => setNuevoMaterial(prev => ({ ...prev, cantidadEnStock: parseFloat(e.target.value) || 0 }))}
                            className="bg-surface-50 font-numeric"
                        />
                    </div>
                    <Button 
                        fullWidth 
                        onClick={handleCrearMaterial} 
                        isLoading={isLoading}
                        className="rounded-2xl font-black text-xs uppercase tracking-widest h-12 shadow-lg shadow-primary-200 mt-4"
                    >
                        CONFIRMAR ALTA
                    </Button>
                </div>
            </Modal>

            {/* Modal Stock */}
            <Modal
                isOpen={!!modalStock}
                onClose={() => setModalStock(null)}
                title={modalStock?.tipo === 'agregar' ? 'ORDEN DE ABASTECIMIENTO' : 'REGISTRO DE DESPACHO'}
                variant="sheet"
            >
                {modalStock && (
                    <div className="space-y-4 pt-2">
                        <div className="bg-primary-900 p-5 rounded-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest mb-1">Insumo Seleccionado</p>
                                <p className="font-black text-white uppercase text-lg">{modalStock.material.nombre}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-bold bg-white/10 text-white px-2 py-0.5 rounded uppercase">
                                        Stock: {modalStock.material.cantidadEnStock} {modalStock.material.unidad}
                                    </span>
                                </div>
                            </div>
                            <Package className="absolute -right-4 -bottom-4 w-20 h-20 text-white opacity-5" />
                        </div>
                        <Input
                            label={modalStock.tipo === 'agregar' ? 'Ingrese Cantidad a Sumar' : 'Ingrese Cantidad para Obra'}
                            type="number"
                            placeholder="0.00"
                            value={cantidadStock}
                            onChange={(e) => setCantidadStock(e.target.value)}
                            required
                            className="text-lg font-black font-numeric h-14 bg-surface-50"
                        />
                        <Button
                            fullWidth
                            className={`rounded-2xl font-black text-xs uppercase tracking-widest h-14 shadow-lg mt-4 ${
                                modalStock.tipo === 'agregar' 
                                ? 'bg-success-500 hover:bg-success-600 shadow-success-200' 
                                : 'bg-primary-500 hover:bg-primary-600 shadow-primary-200'
                            }`}
                            onClick={handleActualizarStock}
                            isLoading={isLoading}
                        >
                            {modalStock.tipo === 'agregar' ? 'CONFIRMAR CARGA' : 'REGISTRAR SALIDA'}
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default MaterialesPage;
