import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IconSymbolName =
  | 'home'
  | 'notices'
  | 'events'
  | 'services'
  | 'alerts'
  | 'console'
  | 'admin'
  | 'directory'
  | 'careers'
  | 'highlights'
  | 'bell'
  | 'arrow-back'
  | 'search'
  | 'close'
  | 'calendar'
  | 'book'
  | 'chat'
  | 'person'
  | 'checkmark'
  | 'help'
  | 'school'
  | 'tool'
  | 'mail'
  | 'swap'
  | 'document'
  | 'building'
  | 'sparkles'
  | 'weather';

interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color?: string;
  active?: boolean;
}

export const IconSymbol: React.FC<IconSymbolProps> = ({
  name,
  size = 20,
  color = '#475569',
  active = false,
}) => {
  const getIoniconName = (): keyof typeof Ionicons.glyphMap => {
    switch (name) {
      case 'home':
        return active ? 'home' : 'home-outline';
      case 'notices':
        return active ? 'megaphone' : 'megaphone-outline';
      case 'events':
        return active ? 'calendar' : 'calendar-outline';
      case 'services':
        return active ? 'grid' : 'grid-outline';
      case 'alerts':
        return active ? 'warning' : 'warning-outline';
      case 'console':
        return active ? 'settings' : 'settings-outline';
      case 'admin':
        return active ? 'shield-checkmark' : 'shield-checkmark-outline';
      case 'directory':
        return active ? 'people' : 'people-outline';
      case 'careers':
        return active ? 'briefcase' : 'briefcase-outline';
      case 'highlights':
        return active ? 'trophy' : 'trophy-outline';
      case 'bell':
        return active ? 'notifications' : 'notifications-outline';
      case 'arrow-back':
        return 'arrow-back';
      case 'search':
        return 'search-outline';
      case 'close':
        return 'close-circle-outline';
      case 'calendar':
        return active ? 'calendar' : 'calendar-outline';
      case 'book':
        return active ? 'book' : 'book-outline';
      case 'chat':
        return active ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
      case 'person':
        return active ? 'person' : 'person-outline';
      case 'checkmark':
        return 'checkmark-circle-outline';
      case 'help':
        return 'help-circle-outline';
      case 'school':
        return active ? 'school' : 'school-outline';
      case 'tool':
        return active ? 'construct' : 'construct-outline';
      case 'mail':
        return active ? 'mail' : 'mail-outline';
      case 'swap':
        return 'swap-horizontal-outline';
      case 'document':
        return active ? 'document-text' : 'document-text-outline';
      case 'building':
        return active ? 'business' : 'business-outline';
      case 'sparkles':
        return active ? 'sparkles' : 'sparkles-outline';
      case 'weather':
        return active ? 'thunderstorm' : 'thunderstorm-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return <Ionicons name={getIoniconName()} size={size} color={color} />;
};
