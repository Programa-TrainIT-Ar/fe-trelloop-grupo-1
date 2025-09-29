"use client";

import { useNotifications } from "@/components/common/NotificationContext";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/types/notifications";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import { FaArrowRight } from "react-icons/fa";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    loading,
    loadMoreNotifications,
    hasMoreNotifications,
  } = useNotifications();
  const router = useRouter();
  
  const [visibleCount, setVisibleCount] = useState(10);
  const [filteredNotifications, setFilteredNotifications] = useState<AppNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todas');
  
  useEffect(() => {
    console.log('Filtro activo:', activeFilter, 'Total notificaciones:', notifications.length);
    let filtered = notifications;
    
    // Filtrar por tipo
    if (activeFilter && activeFilter !== 'todas') {
      filtered = filtered.filter(notification => {
        switch (activeFilter) {
          case 'asignaciones':
            return notification.type === 'CARD_MEMBER_ADDED' || notification.type === 'BOARD_MEMBER_ADDED';
          case 'comentarios':
            return notification.type === 'COMMENT_ADDED' || notification.type === 'COMMENT_REPLY';
          case 'fechas_limite':
            const priority = notification.resource?.priority || ['alta', 'media', 'baja'][Math.floor(Math.random() * 3)];
            return (notification.type === 'DUE_DATE_REMINDER' || notification.type === 'DUE_DATE_OVERDUE') && priority === 'alta';
          case 'menciones':
            return notification.type === 'USER_MENTIONED' || notification.type === 'CARD_MENTION';
          default:
            return true;
        }
      });
    }
    
    // Filtrar por búsqueda
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    console.log('Notificaciones filtradas:', filtered.length);
    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, activeFilter]);
  
  // Separar notificaciones filtradas por fecha
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayNotifications = filteredNotifications.filter(n => {
    if (!n.createdAt) return false;
    const notificationDate = new Date(n.createdAt);
    notificationDate.setHours(0, 0, 0, 0);
    return notificationDate.getTime() === today.getTime();
  });
  
  const previousNotifications = filteredNotifications.filter(n => {
    if (!n.createdAt) return true;
    const notificationDate = new Date(n.createdAt);
    notificationDate.setHours(0, 0, 0, 0);
    return notificationDate.getTime() < today.getTime();
  });
  
  const visibleNotifications = filteredNotifications.slice(0, visibleCount);
  const hasMoreToShow = filteredNotifications.length > visibleCount;
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(10);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setVisibleCount(10);
  };

  const handleNotificationClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    
    if (notification.resource) {
      if (notification.resource.kind === 'card') {
        router.push(`/dashboard/cards/view?cardId=${notification.resource.id}`);
      } else if (notification.resource.kind === 'board') {
        router.push(`/dashboard/boards/${notification.resource.id}`);
      }
    }
  };

  const getBadges = (notification: AppNotification) => {
    const badges = [];
    
    // Badge de prioridad (con datos de prueba si no existen)
    const priority = notification.resource?.priority || ['alta', 'media', 'baja'][Math.floor(Math.random() * 3)];
    const priorityColors = {
      'alta': 'bg-red-600/20 text-red-300',
      'media': 'bg-yellow-600/20 text-yellow-300',
      'baja': 'bg-green-600/20 text-green-300'
    };
    badges.push({ 
      text: priority.charAt(0).toUpperCase() + priority.slice(1), 
      color: priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-600/20 text-gray-300'
    });
    
    // Badge de etiquetas del formulario (solo las reales del backend)
    if (notification.resource?.labels && notification.resource.labels.length > 0) {
      notification.resource.labels.forEach((label: any) => {
        badges.push({ 
          text: label.name || label, 
          color: 'bg-purple-600/20 text-purple-300'
        });
      });
    }
    
    // Badge de tipo de notificación
    if (notification.type === 'CARD_MEMBER_ADDED') {
      badges.push({ text: 'Etiquetado', color: 'bg-blue-600/20 text-blue-300' });
    } else if (notification.type === 'BOARD_MEMBER_ADDED') {
      badges.push({ text: 'Tablero', color: 'bg-purple-600/20 text-purple-300' });
    }
    
    // Badge de estado (no leída)
    if (!notification.read) {
      badges.push({ text: 'Nueva', color: 'bg-red-600/20 text-red-300' });
    }
    
    return badges;
  };

  return (
    <div className="min-h-screen text-white p-0">
      
      <div className="px-6 pt-6 pb-0">
        <h1 className="text-2xl font-bold mb-6">Historial de notificaciones</h1>
        <NotificationFilters onFilterChange={handleFilterChange} onSearch={handleSearch} />
      </div>

      {/* Notifications List */}
      <div className="bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] mx-6 p-6">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">{searchQuery ? 'No se encontraron notificaciones.' : 'No tienes notificaciones.'}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Notificaciones de Hoy */}
            {todayNotifications.slice(0, Math.min(visibleCount, todayNotifications.length)).length > 0 && (
              <div>
                <h2 className="text-lg font-light mb-4 text-white">Hoy</h2>
                <div className="space-y-3">
                  {todayNotifications.slice(0, Math.min(visibleCount, todayNotifications.length)).map((n: AppNotification) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 p-4 hover:bg-neutral-700/20 rounded-lg transition cursor-pointer ${!n.read ? 'bg-gray-500/20 border-l-4 border-[#6A5FFF]' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      {/* Icono de perfil */}
                      <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {n.actorId ? (
                          <img 
                            src={`https://picsum.photos/40/40?random=${n.actorId}`} 
                            alt="Usuario" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-white text-sm font-medium">U</span>
                        )}
                      </div>
                      
                      {/* Indicador de no leída */}
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-[#6A5FFF] mt-2 flex-shrink-0"></div>
                      )}
                      
                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{n.title}</span>
                          {n.createdAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(n.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{n.message}</p>
                        
                        {/* Badges */}
                        <div className="flex gap-1 flex-wrap">
                          {getBadges(n).map((badge, index) => (
                            <span key={index} className={`px-1.5 py-0.5 text-xs rounded-full ${badge.color}`}>
                              {badge.text}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Flecha */}
                      <div className="text-white flex-shrink-0">
                        <FaArrowRight />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notificaciones Anteriores */}
            {previousNotifications.slice(0, Math.max(0, visibleCount - todayNotifications.length)).length > 0 && (
              <div>
                <h2 className="text-lg font-light mb-4 text-white">Anteriores</h2>
                <div className="space-y-3">
                  {previousNotifications.slice(0, Math.max(0, visibleCount - todayNotifications.length)).map((n: AppNotification) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 p-4 hover:bg-neutral-700/20 rounded-lg transition cursor-pointer ${!n.read ? 'bg-gray-500/20 border-l-4 border-[#6A5FFF]' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      {/* Icono según tipo */}
                      <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {n.actorId ? (
                          <img 
                            src={`https://picsum.photos/40/40?random=${n.actorId}`} 
                            alt="Usuario" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          n.read ? (
                            <span className="text-green-400 text-lg">✓</span>
                          ) : (
                            <span className="text-white text-sm font-medium">U</span>
                          )
                        )}
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{n.title}</span>
                          {n.createdAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(n.createdAt).toLocaleDateString('es')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{n.message}</p>
                        
                        {/* Badges */}
                        <div className="flex gap-1 flex-wrap">
                          {getBadges(n).map((badge, index) => (
                            <span key={index} className={`px-1.5 py-0.5 text-xs rounded-full ${badge.color}`}>
                              {badge.text}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Flecha */}
                      <div className="text-white flex-shrink-0">
                         <FaArrowRight />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
      
      {/* Botón Cargar Más - Fuera de la lista */}
      {filteredNotifications.length > visibleCount && (
        <div className="text-center mt-6 px-6">
          <button
            onClick={() => setVisibleCount(prev => prev + 10)}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-neutral-600 hover:bg-neutral-500 disabled:opacity-50 text-white"
          >
            Cargar más notificaciones
          </button>
        </div>
      )}
    </div>
  );
}