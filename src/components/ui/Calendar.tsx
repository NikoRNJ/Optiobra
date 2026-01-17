/**
 * OptiObra - Componente Calendar
 * Calendario animado para selección de fechas
 */

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from './Button';

interface CalendarProps {
    selectedStartDate: Date | null;
    selectedEndDate: Date | null;
    onSelectDate: (date: Date) => void;
    onSelectRange?: (start: Date, end: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    mode?: 'single' | 'range';
    className?: string;
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function Calendar({
    selectedStartDate,
    selectedEndDate,
    onSelectDate,
    onSelectRange,
    minDate: _minDate = new Date(),
    mode = 'range',
    className = '',
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDayOfMonth.getDay();

        const days: (Date | null)[] = [];

        // Add empty days for alignment
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of month
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    }, [currentMonth]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setIsAnimating(true);
        setAnimationDirection(direction === 'next' ? 'left' : 'right');

        setTimeout(() => {
            setCurrentMonth(prev => {
                const newDate = new Date(prev);
                if (direction === 'prev') {
                    newDate.setMonth(prev.getMonth() - 1);
                } else {
                    newDate.setMonth(prev.getMonth() + 1);
                }
                return newDate;
            });

            setTimeout(() => setIsAnimating(false), 150);
        }, 150);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date) => {
        if (selectedStartDate && date.toDateString() === selectedStartDate.toDateString()) {
            return 'start';
        }
        if (selectedEndDate && date.toDateString() === selectedEndDate.toDateString()) {
            return 'end';
        }
        return false;
    };

    const isInRange = (date: Date) => {
        if (!selectedStartDate || !selectedEndDate) return false;
        return date > selectedStartDate && date < selectedEndDate;
    };

    const isDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleDateClick = (date: Date) => {
        if (isDisabled(date)) return;

        if (mode === 'single') {
            onSelectDate(date);
            return;
        }

        // Range mode
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            // Start new selection
            onSelectDate(date);
        } else {
            // Complete the range
            if (date < selectedStartDate) {
                onSelectRange?.(date, selectedStartDate);
            } else {
                onSelectRange?.(selectedStartDate, date);
            }
        }
    };

    return (
        <div className={`bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-primary-600">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                    className="text-white hover:bg-primary-500"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <h3 className="text-lg font-bold text-white">
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                    className="text-white hover:bg-primary-500"
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 bg-surface-50 border-b border-surface-200">
                {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="p-2 text-center text-xs font-bold text-surface-500 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div
                className={`
          grid grid-cols-7 gap-1 p-3
          transition-all duration-150 ease-out
          ${isAnimating ? (
                        animationDirection === 'left'
                            ? 'opacity-0 translate-x-4'
                            : 'opacity-0 -translate-x-4'
                    ) : 'opacity-100 translate-x-0'}
        `}
            >
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const selected = isSelected(date);
                    const inRange = isInRange(date);
                    const disabled = isDisabled(date);
                    const today = isToday(date);

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => handleDateClick(date)}
                            disabled={disabled}
                            className={`
                aspect-square rounded-xl flex items-center justify-center
                text-sm font-bold transition-all duration-150
                ${disabled
                                    ? 'text-surface-300 cursor-not-allowed'
                                    : 'cursor-pointer hover:bg-primary-50 active:scale-95'
                                }
                ${today && !selected
                                    ? 'ring-2 ring-primary-400 ring-offset-1'
                                    : ''
                                }
                ${selected === 'start'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : ''
                                }
                ${selected === 'end'
                                    ? 'bg-accent-600 text-white shadow-md'
                                    : ''
                                }
                ${inRange
                                    ? 'bg-primary-100 text-primary-700'
                                    : ''
                                }
                ${!selected && !inRange && !disabled
                                    ? 'text-surface-700'
                                    : ''
                                }
              `}
                        >
                            {date.getDate()}
                            {(selected === 'start' || selected === 'end') && (
                                <span className="absolute">
                                    <Check className="w-3 h-3" />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selection Summary */}
            {selectedStartDate && (
                <div className="p-4 bg-surface-50 border-t border-surface-200">
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <span className="text-surface-500">Inicio:</span>
                            <span className="ml-2 font-bold text-primary-600">
                                {selectedStartDate.toLocaleDateString('es-CL', {
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </span>
                        </div>
                        {selectedEndDate && (
                            <>
                                <div className="w-8 h-0.5 bg-surface-300 mx-2" />
                                <div>
                                    <span className="text-surface-500">Fin:</span>
                                    <span className="ml-2 font-bold text-accent-600">
                                        {selectedEndDate.toLocaleDateString('es-CL', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {selectedEndDate && (
                        <div className="mt-2 text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                                {Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} días
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Calendar;
