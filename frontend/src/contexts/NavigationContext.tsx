import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ScreenId } from '../types/navigation';
import {
  Role,
  User,
  UserStatus,
  Notification,
  Content,
  Alert,
  Society,
  Request,
  Claim,
  Room,
  Booking,
  FAQ,
  Staff,
  RequestStatus,
} from '../types/contract';
import { apiClient } from '../services/apiClient';
import { authService } from '../services/authService';

const EMPTY_USER: User = {
  id: '',
  email: '',
  displayName: 'Campus User',
  role: 'student',
  status: 'active',
  faculty: null,
  programme: null,
  yearGroup: null,
  studentId: null,
  phone: null,
  smsOptIn: false,
  societyIds: [],
  department: null,
  alumniGradYear: null,
  fcmTokens: [],
  notifPrefs: { push: true, categories: { announcement: true, event: true, booking: true, request: true, society: true } },
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

interface NavigationContextValue {
  currentScreen: ScreenId;
  params: Record<string, any>;
  navigate: (screen: ScreenId, params?: Record<string, any>) => void;
  goBack: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeRole: Role;
  setRoleOverride: (role: Role) => void | Promise<void>;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  contents: Content[];
  alerts: Alert[];
  societies: Society[];
  requests: Request[];
  claims: Claim[];
  rooms: Room[];
  bookings: Booking[];
  faqs: FAQ[];
  staff: Staff[];
  toggleEventInterest: (eventId: string) => void;
  joinSociety: (societyId: string, message?: string) => void;
  createRequest: (
    requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'ownerUid' | 'ownerName'>
  ) => Request;
  updateRequestStatus: (requestId: string, status: RequestStatus, resolution?: string) => void;
  createClaim: (requestId: string, answer: string, message: string) => void;
  createBooking: (
    bookingData: Omit<
      Booking,
      'id' | 'createdAt' | 'cancelledAt' | 'cancelReason' | 'uid' | 'userName' | 'slotIds'
    >
  ) => Booking;
  cancelBooking: (bookingId: string, reason?: string) => void;
  createContent: (
    contentData: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'flags' | 'review' | 'interestedCount' | 'shareUrl' | 'viewer'>
  ) => Content;
  updateContent: (id: string, updates: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  users: User[];
  updateUserRole: (uid: string, role: Role) => void;
  updateUserStatus: (uid: string, status: UserStatus) => void;
  createAlert: (
    alertData: Omit<
      Alert,
      'id' | 'createdAt' | 'lastUpdatedAt' | 'publishedAt' | 'resolvedAt' | 'confirmToken' | 'createdBy' | 'confirmedBy' | 'updates'
    >
  ) => Promise<Alert> | Alert;
  resolveAlert: (alertId: string) => void;
  decideClaim: (claimId: string, requestId: string, decision: 'approve' | 'reject', handoverNote?: string) => void;
  approveBooking: (bookingId: string) => void;
  adminCancelBooking: (bookingId: string, reason: string) => void;
  createFAQ: (faq: Omit<FAQ, 'id' | 'updatedAt' | 'helpfulCount' | 'unhelpfulCount'>) => FAQ;
  updateFAQ: (id: string, updates: Partial<FAQ>) => void;
  deleteFAQ: (id: string) => void;
  createStaff: (staffData: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  voteFAQ: (id: string, helpful: boolean) => void;
  unreadNotifsCount: number;
  activeAlertsCount: number;
  signOut: () => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [params, setParams] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<Array<{ screen: ScreenId; params?: Record<string, any> }>>([
    { screen: 'login' },
  ]);

  // Current authenticated user (starts unseeded, requires sign in)
  const [currentUser, setCurrentUserInternal] = useState<User>(EMPTY_USER);
  const [activeRole, setActiveRole] = useState<Role>('student');

  const syncWithBackend = async () => {
    try {
      const [apiAlerts, apiContents, apiRequests, apiRooms, apiBookings, apiFaqs, apiStaff, apiSocieties] =
        await Promise.allSettled([
          apiClient.getAlerts(),
          apiClient.getContents(),
          apiClient.getRequests(),
          apiClient.getRooms(),
          apiClient.getBookings(),
          apiClient.getFAQs(),
          apiClient.getStaff(),
          apiClient.getSocieties(),
        ]);

      if (apiAlerts.status === 'fulfilled' && apiAlerts.value?.length > 0) {
        setAlerts(apiAlerts.value);
      }
      if (apiContents.status === 'fulfilled' && (apiContents.value as any)?.length > 0) {
        setContents(apiContents.value as any);
      }
      if (apiRequests.status === 'fulfilled' && apiRequests.value?.length > 0) {
        setRequests(apiRequests.value);
      }
      if (apiRooms.status === 'fulfilled' && apiRooms.value?.length > 0) {
        setRooms(apiRooms.value);
      }
      if (apiBookings.status === 'fulfilled' && apiBookings.value?.length > 0) {
        setBookings(apiBookings.value);
      }
      if (apiFaqs.status === 'fulfilled' && apiFaqs.value?.length > 0) {
        setFaqs(apiFaqs.value);
      }
      if (apiStaff.status === 'fulfilled' && apiStaff.value?.length > 0) {
        setStaff(apiStaff.value);
      }
      if (apiSocieties.status === 'fulfilled' && apiSocieties.value?.length > 0) {
        setSocieties(apiSocieties.value);
      }
    } catch (err) {
      console.log('Backend sync running in offline/local mock mode:', err);
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserInternal(user);
    setActiveRole(user.role);
    apiClient.setApiAuthUser({ uid: user.id, email: user.email, role: user.role });
    syncWithBackend();
  };

  const signOut = () => {
    authService.logout().catch(() => {});
    setCurrentUserInternal(EMPTY_USER);
    setActiveRole('student');
    setCurrentScreen('login');
    setParams({});
    setHistory([{ screen: 'login' }]);
  };

  // Interactive local states initialized completely empty (zero seeded data)
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Synchronize state with backend API on initialization + restore active session
  React.useEffect(() => {
    let isMounted = true;
    const initSessionAndData = async () => {
      try {
        const restoredUser = await authService.validateSession();
        if (restoredUser && isMounted) {
          setCurrentUserInternal(restoredUser);
          setActiveRole(restoredUser.role);
          apiClient.setApiAuthUser({ uid: restoredUser.id, email: restoredUser.email, role: restoredUser.role });
        }
      } catch (err) {
        console.warn('Session restoration notice:', err);
      }
      if (isMounted) {
        await syncWithBackend();
      }
    };
    initSessionAndData();
    return () => {
      isMounted = false;
    };
  }, []);

  const navigate = (screen: ScreenId, newParams: Record<string, any> = {}) => {
    setParams(newParams);
    setCurrentScreen(screen);
    setHistory((prev) => [...prev, { screen, params: newParams }]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // remove current
      const previous = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentScreen(previous.screen);
      setParams(previous.params || {});
    } else {
      setCurrentScreen('home');
      setParams({});
    }
  };

  const setRoleOverride = async (role: Role) => {
    setActiveRole(role);
    try {
      const res = await authService.switchDemoRole(role as any);
      if (res?.user) {
        setCurrentUserInternal(res.user);
        apiClient.setApiAuthUser({ uid: res.user.id, email: res.user.email, role: res.user.role });
      }
    } catch (e: any) {
      console.warn('setRoleOverride fallback notice:', e?.message);
      setCurrentUserInternal((prev) => {
        const updated = { ...prev, role };
        apiClient.setApiAuthUser({ uid: updated.id, email: updated.email, role });
        return updated;
      });
    }
    await syncWithBackend();
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
  };

  // Event RSVP toggle
  const toggleEventInterest = (eventId: string) => {
    setContents((prev) =>
      prev.map((item) => {
        if (item.id === eventId) {
          const isCurrentlyInterested = item.viewer?.interested || false;
          const newCount = isCurrentlyInterested
            ? Math.max(0, item.interestedCount - 1)
            : item.interestedCount + 1;

          return {
            ...item,
            interestedCount: newCount,
            viewer: {
              ...item.viewer,
              interested: !isCurrentlyInterested,
              canEdit: item.viewer?.canEdit || false,
            },
          };
        }
        return item;
      })
    );
  };

  // Society Join
  const joinSociety = (societyId: string, message?: string) => {
    setSocieties((prev) =>
      prev.map((soc) => {
        if (soc.id === societyId) {
          const newStatus = soc.joinMode === 'open' ? 'approved' : 'pending';
          const newCount = soc.joinMode === 'open' ? soc.memberCount + 1 : soc.memberCount;
          return {
            ...soc,
            memberCount: newCount,
            viewer: {
              membership: newStatus,
            },
          };
        }
        return soc;
      })
    );
  };

  // Create Generic Request (Lost, Found, Facility, Academic, Feedback, Textbook)
  const createRequest = (
    requestData: Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'ownerUid' | 'ownerName'>
  ): Request => {
    const newReq: Request = {
      ...requestData,
      id: `req_${Date.now()}`,
      ownerUid: currentUser.id,
      ownerName: currentUser.displayName,
      status: requestData.status || 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
    };

    setRequests((prev) => [newReq, ...prev]);

    // Dispatch to Backend API
    apiClient.createRequest(newReq).catch((err) => {
      console.warn('API sync: Request stored locally (backend unreachable):', err.message);
    });

    return newReq;
  };

  // Update Request Status & Resolution
  const updateRequestStatus = (requestId: string, status: RequestStatus, resolution?: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status,
            resolution: resolution !== undefined ? resolution : r.resolution,
            updatedAt: new Date().toISOString(),
            resolvedAt: status === 'resolved' || status === 'closed' ? new Date().toISOString() : r.resolvedAt,
          };
        }
        return r;
      })
    );

    // Dispatch to Backend API
    apiClient.updateRequest(requestId, { status, resolution }).catch((err) => {
      console.warn('API sync: Request update stored locally:', err.message);
    });
  };

  // Create claim for found item
  const createClaim = (requestId: string, answer: string, message: string) => {
    const newClaim: Claim = {
      id: `clm_${Date.now()}`,
      requestId,
      claimantUid: currentUser.id,
      claimantName: currentUser.displayName,
      answer,
      message,
      status: 'pending',
      decidedBy: null,
      decidedAt: null,
      createdAt: new Date().toISOString(),
    };

    setClaims((prev) => [newClaim, ...prev]);

    // Update request status to in_progress
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'in_progress' } : r))
    );

    // Dispatch to Backend API
    apiClient.createClaim(requestId, { answer, message }).catch((err) => {
      console.warn('API sync: Claim stored locally:', err.message);
    });
  };

  // Create Room Booking
  const createBooking = (
    bookingData: Omit<
      Booking,
      'id' | 'createdAt' | 'cancelledAt' | 'cancelReason' | 'uid' | 'userName' | 'slotIds'
    >
  ): Booking => {
    const bookingId = `bk_${Date.now()}`;
    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      uid: currentUser.id,
      userName: currentUser.displayName,
      status: 'confirmed',
      source: 'student',
      slotIds: [`${bookingData.roomId}_${bookingData.startsAt}`],
      createdAt: new Date().toISOString(),
      cancelledAt: null,
      cancelReason: null,
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Dispatch to Backend API
    apiClient.createBooking(bookingData).catch((err) => {
      console.warn('API sync: Booking stored locally:', err.message);
    });

    return newBooking;
  };

  // Cancel Room Booking
  const cancelBooking = (bookingId: string, reason?: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled',
              cancelledAt: new Date().toISOString(),
              cancelReason: reason || 'Cancelled by user',
            }
          : b
      )
    );

    // Dispatch to Backend API
    apiClient.cancelBooking(bookingId, reason).catch((err) => {
      console.warn('API sync: Booking cancellation stored locally:', err.message);
    });
  };

  // Create Content / Announcement (Staff Console End-to-End)
  const createContent = (
    contentData: Omit<
      Content,
      'id' | 'createdAt' | 'updatedAt' | 'version' | 'flags' | 'review' | 'interestedCount' | 'shareUrl' | 'viewer'
    >
  ): Content => {
    const newContentId = `cnt_${Date.now()}`;
    const newContent: Content = {
      ...contentData,
      id: newContentId,
      interestedCount: 0,
      flags: { affectedByAlertId: null },
      review: { reviewedBy: null, reviewedAt: null, reason: null },
      version: 1,
      shareUrl: `https://ucl.demo/c/${newContentId}`,
      viewer: { interested: false, canEdit: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContents((prev) => [newContent, ...prev]);

    // Dispatch to Backend API
    apiClient.createContent(newContent).catch((err) => {
      console.warn('API sync: Content creation stored locally:', err.message);
    });

    return newContent;
  };

  // Update Content
  const updateContent = (id: string, updates: Partial<Content>) => {
    setContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );

    apiClient.updateContent(id, updates).catch((err) => {
      console.warn('API sync: Content update stored locally:', err.message);
    });
  };

  // Delete / Archive Content
  const deleteContent = (id: string) => {
    setContents((prev) => prev.filter((c) => c.id !== id));

    apiClient.deleteContent(id).catch((err) => {
      console.warn('API sync: Content delete stored locally:', err.message);
    });
  };

  // User Role & Status updates (BR12)
  const updateUserRole = (uid: string, newRole: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role: newRole } : u)));
    if (currentUser.id === uid) {
      setCurrentUser({ ...currentUser, role: newRole });
      setActiveRole(newRole);
    }

    apiClient.updateUserRole(uid, newRole).catch((err) => {
      console.warn('API sync: User role update stored locally:', err.message);
    });
  };

  const updateUserStatus = (uid: string, status: UserStatus) => {
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, status } : u)));

    apiClient.updateUserStatus(uid, status).catch((err) => {
      console.warn('API sync: User status update stored locally:', err.message);
    });
  };

  // Create Alert / Broadcast (BR15, BR16)
  const createAlert = async (
    alertData: Omit<
      Alert,
      'id' | 'createdAt' | 'lastUpdatedAt' | 'publishedAt' | 'resolvedAt' | 'confirmToken' | 'createdBy' | 'confirmedBy' | 'updates'
    >
  ): Promise<Alert> => {
    const alertId = `alt_${Date.now()}`;
    const newAlert: Alert = {
      ...alertData,
      id: alertId,
      status: alertData.status || 'active',
      confirmToken: null,
      confirmedBy: currentUser.id,
      createdBy: {
        uid: currentUser.id,
        name: currentUser.displayName,
        role: currentUser.role,
      },
      publishedAt: new Date().toISOString(),
      resolvedAt: null,
      lastUpdatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updates: [
        {
          at: new Date().toISOString(),
          text: 'Initial broadcast dispatched to campus safety channels.',
          by: currentUser.displayName,
        },
      ],
      impact: {
        eventsFlagged: alertData.affects?.flagEvents ? 2 : 0,
        bookingsCancelled: alertData.affects?.cancelBookings ? 3 : 0,
        usersNotified: 1840,
        smsSent: alertData.sendSms ? 1212 : 0,
      },
    };

    // If cancelBookings is true, cancel affected active bookings
    if (alertData.affects?.cancelBookings) {
      setBookings((prev) =>
        prev.map((b) =>
          b.status === 'confirmed'
            ? {
                ...b,
                status: 'cancelled_by_closure' as any,
                cancelReason: `Cancelled due to safety alert: ${alertData.title}`,
                cancelledAt: new Date().toISOString(),
              }
            : b
        )
      );
    }

    try {
      const res = await apiClient.createAlert({
        kind: alertData.kind,
        title: alertData.title,
        body: alertData.body,
        affects: alertData.affects,
        sendSms: alertData.sendSms,
      });

      if (res?.id) {
        await apiClient.confirmAlert(res.id);
        const freshAlerts = await apiClient.getAlerts();
        if (freshAlerts && freshAlerts.length > 0) {
          setAlerts(freshAlerts);
        } else {
          setAlerts((prev) => [{ ...newAlert, id: res.id }, ...prev]);
        }
      } else {
        setAlerts((prev) => [newAlert, ...prev]);
      }
    } catch (err: any) {
      console.warn('API createAlert notice:', err?.message);
      setAlerts((prev) => [newAlert, ...prev]);
    }

    return newAlert;
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              lastUpdatedAt: new Date().toISOString(),
              updates: [
                ...a.updates,
                {
                  at: new Date().toISOString(),
                  text: 'Alert resolved. Campus operations return to normal.',
                  by: currentUser.displayName,
                },
              ],
            }
          : a
      )
    );

    apiClient.resolveAlert(alertId).catch((err) => {
      console.warn('API sync: Alert resolve stored locally:', err.message);
    });
  };

  // Lost & Found Claim Decision
  const decideClaim = (
    claimId: string,
    requestId: string,
    decision: 'approve' | 'reject',
    handoverNote?: string
  ) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: decision === 'approve' ? 'approved' : 'rejected',
              decidedBy: currentUser.displayName,
              decidedAt: new Date().toISOString(),
            }
          : c
      )
    );

    if (decision === 'approve') {
      updateRequestStatus(
        requestId,
        'resolved',
        handoverNote ? `Collected and verified: ${handoverNote}` : 'Item successfully claimed and collected.'
      );
    }
  };

  // Room Booking Approvals (Admin)
  const approveBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
    );
  };

  const adminCancelBooking = (bookingId: string, reason: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled_by_admin',
              cancelReason: reason,
              cancelledAt: new Date().toISOString(),
            }
          : b
      )
    );

    apiClient.cancelBooking(bookingId, reason).catch((err) => {
      console.warn('API sync: Admin booking cancel stored locally:', err.message);
    });
  };

  // FAQ Management
  const createFAQ = (
    faqData: Omit<FAQ, 'id' | 'updatedAt' | 'helpfulCount' | 'unhelpfulCount'>
  ): FAQ => {
    const newFAQ: FAQ = {
      ...faqData,
      id: `faq_${Date.now()}`,
      helpfulCount: 0,
      unhelpfulCount: 0,
      updatedAt: new Date().toISOString(),
    };
    setFaqs((prev) => [newFAQ, ...prev]);

    apiClient.createFAQ(newFAQ).catch((err) => {
      console.warn('API sync: FAQ created locally:', err.message);
    });

    return newFAQ;
  };

  const updateFAQ = (id: string, updates: Partial<FAQ>) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f))
    );

    apiClient.updateFAQ(id, updates).catch((err) => {
      console.warn('API sync: FAQ update stored locally:', err.message);
    });
  };

  const deleteFAQ = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));

    apiClient.deleteFAQ(id).catch((err) => {
      console.warn('API sync: FAQ delete stored locally:', err.message);
    });
  };

  // Staff Directory Management
  const createStaff = (staffData: Omit<Staff, 'id'>): Staff => {
    const newStaff: Staff = {
      ...staffData,
      id: `stf_${Date.now()}`,
    };
    setStaff((prev) => [...prev, newStaff]);

    apiClient.createStaff(newStaff).catch((err) => {
      console.warn('API sync: Staff member created locally:', err.message);
    });

    return newStaff;
  };

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    apiClient.updateStaff(id, updates).catch((err) => {
      console.warn('API sync: Staff update stored locally:', err.message);
    });
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));

    apiClient.deleteStaff(id).catch((err) => {
      console.warn('API sync: Staff delete stored locally:', err.message);
    });
  };

  // Vote on FAQ
  const voteFAQ = (id: string, helpful: boolean) => {
    setFaqs((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            helpfulCount: helpful ? f.helpfulCount + 1 : f.helpfulCount,
            unhelpfulCount: !helpful ? f.unhelpfulCount + 1 : f.unhelpfulCount,
          };
        }
        return f;
      })
    );

    apiClient.voteFAQ(id, helpful).catch((err) => {
      console.warn('API sync: FAQ vote recorded locally:', err.message);
    });
  };

  const unreadNotifsCount = notifications.filter(
    (n) => n.uid === currentUser.id && n.readAt === null
  ).length;

  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;

  const value: NavigationContextValue = {
    currentScreen,
    params,
    navigate,
    goBack,
    currentUser,
    setCurrentUser,
    activeRole,
    setRoleOverride,
    users,
    updateUserRole,
    updateUserStatus,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    contents,
    alerts,
    createAlert,
    resolveAlert,
    societies,
    requests,
    claims,
    decideClaim,
    rooms,
    bookings,
    approveBooking,
    adminCancelBooking,
    faqs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    staff,
    createStaff,
    updateStaff,
    deleteStaff,
    toggleEventInterest,
    joinSociety,
    createRequest,
    updateRequestStatus,
    createClaim,
    createBooking,
    cancelBooking,
    createContent,
    updateContent,
    deleteContent,
    voteFAQ,
    unreadNotifsCount,
    activeAlertsCount,
    signOut,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
