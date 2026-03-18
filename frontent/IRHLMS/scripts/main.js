import { Router } from '../utilities/router.js';
import { ThemeManager } from '../utilities/theme.js';
import { store } from '../utilities/store.js';
import { Sidebar } from '../components/sidebar/sidebar.js';
import { Navbar } from '../components/navbar/navbar.js';
import { NotificationPanel } from '../components/notification-panel/notification-panel.js';
import { Modal } from '../components/modal/modal.js';
import { DashboardPage } from '../pages/dashboard/dashboard.js';
import { PhysioPage } from '../pages/physio/physio.js';
import { LearningPage } from '../pages/learning/learning.js';
import { HabitsPage } from '../pages/habits/habits.js';
import { MedicalPage } from '../pages/medical/medical.js';
import { TherapyPage } from '../pages/therapy/therapy.js';
import { AchievementsPage } from '../pages/achievements/achievements.js';
import { FeedbackPage } from '../pages/feedback/feedback.js';
import { SettingsPage } from '../pages/settings/settings.js';

const router = new Router();
const theme = new ThemeManager();
const notifPanel = new NotificationPanel();

const sidebar = new Sidebar({
  onNavigate: (pageId) => {
    router.go(pageId);
    notifPanel.onNavigate();
  }
});

const navbar = new Navbar({
  onThemeToggle: () => theme.toggle(),
  onSettingsClick: () => {
    router.go('settings');
    notifPanel.onNavigate();
  }
});

const pageHandlers = {
  dashboard: () => DashboardPage.init(store),
  physio: () => PhysioPage.init(store),
  learning: () => LearningPage.init(store),
  habits: () => HabitsPage.init(store, sidebar),
  medical: () => MedicalPage.init(store),
  therapy: () => TherapyPage.init(),
  achievements: () => AchievementsPage.init(store),
  feedback: () => FeedbackPage.init(store),
  settings: () => SettingsPage.init()
};

router.onNavigate((pageId) => {
  sidebar.setActive(pageId);
  pageHandlers[pageId]?.();
});

document.addEventListener('DOMContentLoaded', () => {
  theme.init();
  navbar.init();
  notifPanel.init();
  Modal.init();
  sidebar.init();

  // Settings data is used in multiple places (sidebar profile, dashboard greeting)
  // so initialize it once during app boot.
  SettingsPage.init();

  router.go('dashboard');
});
