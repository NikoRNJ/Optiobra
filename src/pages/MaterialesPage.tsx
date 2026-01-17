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
    ArrowUpCircle,
    ArrowDownCircle,
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
        <Card className={stockBajo ? 'border-l-4 border-l-warning-500' : ''}>
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-surface-900 truncate">{material.nombre}</h3>
                        {stockBajo && (
                            <AlertTriangle className="w-4 h-4 text-warning-500 flex-shrink-0" />
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge size="sm" variant="default">{material.categoria}</Badge>
                        <span className="text-xs text-surface-500">{material.unidad}</span>
                    </div>
                </div>
            </div>

            {/* Stock Info */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="bg-surface-50 rounded-lg p-2">
                    <p className="text-xs text-surface-500">Requerido</p>
                    <p className="font-bold font-numeric text-surface-900">{material.cantidadRequerida}</p>
                </div>
                <div className="bg-success-50 rounded-lg p-2">
                    <p className="text-xs text-success-600">En Stock</p>
                    <p className="font-bold font-numeric text-success-700">{material.cantidadEnStock}</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-2">
                    <p className="text-xs text-primary-600">Utilizado</p>
                    <p className="font-bold font-numeric text-primary-700">{material.cantidadUtilizada}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden mb-3">
                <div
                    className={`h-full rounded-full transition-all ${stockBajo ? 'bg-warning-500' : 'bg-success-500'
                        }`}
                    style={{ width: `${Math.min(porcentajeStock, 100)}%` }}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="success"
                    fullWidth
                    leftIcon={<ArrowUpCircle className="w-4 h-4" />}
                    onClick={onAgregarStock}
                >
                    Agregar
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    fullWidth
                    leftIcon={<ArrowDownCircle className="w-4 h-4" />}
                    onClick={onUsarStock}
                >
                    Usar
                </Button>
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
        <div className="min-h-full px-5 py-4">
            {/* Header */}
            <div className="bg-white border border-surface-200 rounded-2xl shadow-card mb-4">
                <div className="p-5">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-accent-600 flex items-center justify-center shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-surface-900">Materiales</h1>
                                <p className="text-sm text-surface-600">Inventario por obra</p>
                            </div>
                        </div>
                        {obraSeleccionada && (
                            <Button
                                size="sm"
                                leftIcon={<Plus className="w-4 h-4" />}
                                onClick={() => setModalNuevo(true)}
                            >
                                Nuevo
                            </Button>
                        )}
                    </div>

                    <Select
                        label="Seleccionar Obra"
                        value={obraSeleccionada}
                        onChange={(e) => setObraSeleccionada(e.target.value)}
                        options={[
                            { value: '', label: 'Seleccione una obra...' },
                            ...obras.map(o => ({ value: o.id!, label: o.nombre })),
                        ]}
                    />
                </div>
            </div>

            {!obraSeleccionada ? (
                <Card className="border-2 border-dashed border-surface-300">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Building2 className="w-16 h-16 text-surface-300 mb-4" />
                        <p className="font-bold text-surface-600">Seleccione una obra</p>
                        <p className="text-sm text-surface-500 mt-1">
                            Para ver y gestionar sus materiales
                        </p>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Filters */}
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar material..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                            />
                        </div>
                        <Select
                            value={categoriaFiltro}
                            onChange={(e) => setCategoriaFiltro(e.target.value)}
                            options={[
                                { value: '', label: 'Todas' },
                                ...CATEGORIAS.map(c => ({ value: c, label: c })),
                            ]}
                            className="w-32"
                        />
                    </div>

                    {/* Materials List */}
                    {materialesFiltrados.length === 0 ? (
                        <EmptyState
                            icon={<Package className="w-10 h-10 text-surface-400" />}
                            title="Sin materiales"
                            description="Agregue materiales al inventario de esta obra"
                            variant="card"
                            action={{
                                label: 'Agregar Material',
                                onClick: () => setModalNuevo(true),
                            }}
                        />
                    ) : (
                        <div className="space-y-3">
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
                </>
            )}

            {/* Modal Nuevo Material */}
            <Modal
                isOpen={modalNuevo}
                onClose={() => setModalNuevo(false)}
                title="Nuevo Material"
                variant="sheet"
            >
                <div className="space-y-4">
                    <Input
                        label="Nombre del Material"
                        placeholder="Ej: Cemento Polpaico"
                        value={nuevoMaterial.nombre}
                        onChange={(e) => setNuevoMaterial(prev => ({ ...prev, nombre: e.target.value }))}
                        required
                    />
                    <Select
                        label="Categoría"
                        value={nuevoMaterial.categoria}
                        onChange={(e) => setNuevoMaterial(prev => ({ ...prev, categoria: e.target.value }))}
                        options={[
                            { value: '', label: 'Seleccione...' },
                            ...CATEGORIAS.map(c => ({ value: c, label: c })),
                        ]}
                        required
                    />
                    <Select
                        label="Unidad de Medida"
                        value={nuevoMaterial.unidad}
                        onChange={(e) => setNuevoMaterial(prev => ({ ...prev, unidad: e.target.value as UnidadMedida }))}
                        options={UNIDADES}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Cantidad Requerida"
                            type="number"
                            value={nuevoMaterial.cantidadRequerida || ''}
                            onChange={(e) => setNuevoMaterial(prev => ({ ...prev, cantidadRequerida: parseFloat(e.target.value) || 0 }))}
                        />
                        <Input
                            label="Stock Inicial"
                            type="number"
                            value={nuevoMaterial.cantidadEnStock || ''}
                            onChange={(e) => setNuevoMaterial(prev => ({ ...prev, cantidadEnStock: parseFloat(e.target.value) || 0 }))}
                        />
                    </div>
                    <Button fullWidth onClick={handleCrearMaterial} isLoading={isLoading}>
                        Guardar Material
                    </Button>
                </div>
            </Modal>

            {/* Modal Stock */}
            <Modal
                isOpen={!!modalStock}
                onClose={() => setModalStock(null)}
                title={modalStock?.tipo === 'agregar' ? 'Agregar al Stock' : 'Registrar Uso'}
                variant="sheet"
            >
                {modalStock && (
                    <div className="space-y-4">
                        <div className="bg-surface-50 p-4 rounded-xl">
                            <p className="font-bold text-surface-900">{modalStock.material.nombre}</p>
                            <p className="text-sm text-surface-600">
                                Stock actual: {modalStock.material.cantidadEnStock} {modalStock.material.unidad}
                            </p>
                        </div>
                        <Input
                            label={modalStock.tipo === 'agregar' ? 'Cantidad a Agregar' : 'Cantidad Utilizada'}
                            type="number"
                            placeholder="0"
                            value={cantidadStock}
                            onChange={(e) => setCantidadStock(e.target.value)}
                            required
                        />
                        <Button
                            fullWidth
                            variant={modalStock.tipo === 'agregar' ? 'success' : 'primary'}
                            onClick={handleActualizarStock}
                            isLoading={isLoading}
                        >
                            {modalStock.tipo === 'agregar' ? 'Agregar Stock' : 'Registrar Uso'}
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default MaterialesPage;
