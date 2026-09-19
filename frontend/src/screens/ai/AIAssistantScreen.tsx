import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Header, Button } from '../../components/common';
import { useNavigation } from '../../contexts/NavigationContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    screen: string;
    params?: Record<string, any>;
  };
  feedback?: 'helpful' | 'unhelpful' | null;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_01',
    sender: 'assistant',
    text: 'Hello! I am your UCL AI Campus Assistant. You can ask me about lecture halls, examination timetables, room bookings, lost items, society meetings, or campus services.',
    timestamp: '09:00 AM',
  },
];

const SUGGESTIONS = [
  'How do I book a study room?',
  'Where is the Lost & Found desk?',
  'When is the Add/Drop deadline?',
  'Contact student counsellor',
  'Browse upcoming hackathons & workshops',
];

export const AIAssistantScreen: React.FC = () => {
  const { goBack, navigate } = useNavigation();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const getAssistantReply = (userQuery: string): { text: string; action?: { label: string; screen: any; params?: any } } => {
    const q = userQuery.toLowerCase();

    if (q.includes('book') || q.includes('room') || q.includes('classroom') || q.includes('study space')) {
      return {
        text: 'You can book group study rooms (B204/B205) and browse live classroom timetables instantly through the Classroom Availability browser. Study rooms are instant confirmation for UCL students.',
        action: {
          label: '📅 Browse Room Availability & Book',
          screen: 'classroom_availability',
        },
      };
    }

    if (q.includes('lost') || q.includes('found') || q.includes('calculator') || q.includes('wallet') || q.includes('bottle')) {
      return {
        text: 'The UCL Lost & Found Registry is active on the hub. If you lost an item, log a report with location details. If you found an item, drop it off at Block A Security Desk and log a found entry with a private verification detail.',
        action: {
          label: '🔍 Open Lost & Found Registry',
          screen: 'lost_found_feed',
        },
      };
    }

    if (q.includes('add/drop') || q.includes('deadline') || q.includes('exam') || q.includes('calendar') || q.includes('holiday')) {
      return {
        text: 'According to the official Academic Calendar, the Semester 1 Add/Drop module deadline is 30 September 2026 at 4:00 PM. Final semester examinations begin from mid-November.',
        action: {
          label: '📆 View Academic Calendar',
          screen: 'academic_calendar',
        },
      };
    }

    if (q.includes('counsellor') || q.includes('wellbeing') || q.includes('mental') || q.includes('stress') || q.includes('staff')) {
      return {
        text: 'You can reach Ms. Dilani Fernando (Senior Student Counsellor) at Admin Block Room 12 during office hours (Mon–Fri 9:00 AM – 4:00 PM) or via counsellor@ucl.demo for confidential advising.',
        action: {
          label: '🧑‍🏫 View Staff Directory',
          screen: 'staff_directory',
        },
      };
    }

    if (q.includes('event') || q.includes('workshop') || q.includes('hackathon') || q.includes('fair')) {
      return {
        text: 'Upcoming campus highlights include the Freshers\' Welcome Fair (24 Sep at Main Quad) and the Robotics Open Build Night (25 Sep in Lab 2). You can RSVP directly to save a seat.',
        action: {
          label: '🎉 Explore Campus Events',
          screen: 'events_feed',
        },
      };
    }

    if (q.includes('textbook') || q.includes('book') || q.includes('buy') || q.includes('sell')) {
      return {
        text: 'UCL students share and trade course textbooks on the Peer Textbook Exchange board. You can browse free giveaways, swaps, or student sales for SE201, CS202, and more.',
        action: {
          label: '📚 Browse Textbook Exchange',
          screen: 'browse_textbooks',
        },
      };
    }

    return {
      text: `Regarding "${userQuery}": For personalized assistance, you can submit an official inquiry ticket to UCL Student Affairs or check our categorized FAQ center.`,
      action: {
        label: '❓ Browse Campus FAQs',
        screen: 'faq',
      },
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI grounded response
    setTimeout(() => {
      const reply = getAssistantReply(text);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: reply.action,
        feedback: null,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 600);
  };

  const handleFeedback = (msgId: string, helpful: 'helpful' | 'unhelpful') => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: helpful } : m))
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="AI Campus Assistant"
        subtitle="Authoritative UCL Knowledgebase"
        showBack
        onBack={goBack}
        rightAction={{
          label: 'FAQs',
          onPress: () => navigate('faq'),
        }}
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification banner */}
        <View style={styles.verifiedBanner}>
          <Text style={styles.verifiedText}>
            🔒 Grounded in official UCL campus regulations, academic timetables, and facilities registry.
          </Text>
        </View>

        {/* Message Bubbles */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                isUser ? styles.messageWrapperUser : styles.messageWrapperAssistant,
              ]}
            >
              {!isUser && (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarEmoji}>🤖</Text>
                </View>
              )}

              <View style={styles.bubbleCol}>
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAssistant,
                  ]}
                >
                  <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAssistant]}>
                    {msg.text}
                  </Text>
                </View>

                {/* Deep Link Action Button */}
                {msg.action && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigate(msg.action!.screen as any, msg.action!.params)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>{msg.action.label}</Text>
                  </TouchableOpacity>
                )}

                {/* Timestamp & Feedback (for Assistant) */}
                <View style={[styles.metaRow, isUser && { justifyContent: 'flex-end' }]}>
                  <Text style={styles.timestampText}>{msg.timestamp}</Text>
                  {!isUser && (
                    <View style={styles.feedbackRow}>
                      <TouchableOpacity
                        onPress={() => handleFeedback(msg.id, 'helpful')}
                        style={[styles.feedbackBtn, msg.feedback === 'helpful' && styles.feedbackBtnActive]}
                      >
                        <Text style={styles.feedbackEmoji}>👍</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleFeedback(msg.id, 'unhelpful')}
                        style={[styles.feedbackBtn, msg.feedback === 'unhelpful' && styles.feedbackBtnActive]}
                      >
                        <Text style={styles.feedbackEmoji}>👎</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {isTyping && (
          <View style={[styles.messageWrapper, styles.messageWrapperAssistant]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>🤖</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
              <Text style={styles.typingText}>Searching UCL records...</Text>
            </View>
          </View>
        )}

        {/* Suggestion Chips */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggested Prompts:</Text>
          <View style={styles.chipsWrap}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => handleSend(s)}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionChipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask anything about UCL campus..."
          placeholderTextColor={colors.neutral[400]}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  verifiedBanner: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: radius.md,
    padding: spacing[2.5],
    marginBottom: spacing[4],
  },
  verifiedText: {
    ...typography.caption,
    color: colors.primary[900],
    fontWeight: '600',
    textAlign: 'center',
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: spacing[4],
    maxWidth: '88%',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageWrapperAssistant: {
    alignSelf: 'flex-start',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[2],
    marginTop: 2,
  },
  avatarEmoji: {
    fontSize: 16,
  },
  bubbleCol: {
    flex: 1,
  },
  bubble: {
    borderRadius: radius.md,
    padding: spacing[3.5],
  },
  bubbleUser: {
    backgroundColor: colors.primary[600],
    borderBottomRightRadius: 2,
  },
  bubbleAssistant: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderBottomLeftRadius: 2,
  },
  typingBubble: {
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[3.5],
  },
  typingText: {
    ...typography.bodySm,
    color: colors.neutral[500],
    fontStyle: 'italic',
  },
  messageText: {
    ...typography.bodySm,
    lineHeight: 20,
  },
  messageTextUser: {
    color: colors.neutral[0],
  },
  messageTextAssistant: {
    color: colors.neutral[900],
  },
  actionButton: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: radius.sm,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    marginTop: spacing[2],
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.primary[800],
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
    gap: spacing[2],
  },
  timestampText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.neutral[400],
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  feedbackBtn: {
    padding: 2,
    borderRadius: radius.sm,
  },
  feedbackBtnActive: {
    backgroundColor: colors.primary[100],
  },
  feedbackEmoji: {
    fontSize: 12,
  },
  suggestionsContainer: {
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  suggestionsTitle: {
    ...typography.caption,
    color: colors.neutral[500],
    fontWeight: '700',
    marginBottom: spacing[2],
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
  },
  suggestionChip: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },
  suggestionChipText: {
    ...typography.caption,
    color: colors.neutral[700],
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing[3],
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    fontSize: 14,
    color: colors.neutral[900],
    marginRight: spacing[2],
  },
  sendButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    borderRadius: radius.full,
  },
  sendButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  sendButtonText: {
    ...typography.labelSm,
    color: colors.neutral[0],
    fontWeight: '700',
  },
});
