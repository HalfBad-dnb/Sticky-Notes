// TypeScript interfaces for navigation data
import { IconType } from '../components/common/Icon';

export interface NavigationButton {
  id: string;
  title: string;
  iconType: IconType;
  route: string;
}

export interface DropdownData {
  id: string;
  title: string;
  iconType: IconType;
  items: string[];
}

export interface MediaDropdownData {
  id: string;
  title: string;
  type: string;
  iconType: IconType;
}

// Navigation data models for the application
export const navigationButtonsData: NavigationButton[] = [
  {
    id: 'home',
    title: "Home",
    iconType: 'home',
    route: '/'
  },
  {
    id: 'profile',
    title: "Profile",
    iconType: 'profile',
    route: '/profile'
  },
  {
    id: 'createBoard',
    title: "Create Board",
    iconType: 'createBoard',
    route: '/create-board'
  },
  {
    id: 'addMembers',
    title: "Add Members",
    iconType: 'addMembers',
    route: '/add-members'
  },
  {
    id: 'boardSettings',
    title: "Board Settings",
    iconType: 'boardSettings',
    route: '/board-settings'
  }
];

export const dropdownsData: DropdownData[] = [
  {
    id: 'boardRules',
    title: "Rules",
    iconType: 'boardRules',
    items: [
      "20 dislikes will delete a note",
      "Down below you can find more info and updates about the board",
      "Done notes are shown in Done Notes section",
      "Board are limited to 10 notes"
    ]
  },
  {
    id: 'projectStatus',
    title: "Status",
    iconType: 'projectStatus',
    items: [
      "Project still in beta",
      "Some features may not work as expected",
      "We are actively working on improvements",
      "Expect occasional downtime"
    ]
  },
  {
    id: 'eventFeatures',
    title: "Events",
    iconType: 'eventFeatures',
    items: [
      "Use for live events and presentations",
      "Interactive Q&A sessions with audience",
      "Real-time feedback collection",
      "Organize brainstorming sessions"
    ]
  }
];

export const mediaDropdownsData: MediaDropdownData[] = [
  {
    id: 'youtube',
    title: "YouTube",
    type: 'youtube',
    iconType: 'youtube'
  },
  {
    id: 'spotify',
    title: "Spotify",
    type: 'spotify',
    iconType: 'spotify'
  }
];
