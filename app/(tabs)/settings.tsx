import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Platform, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, BellOff, Clock, Trophy, TrendingUp, Moon, Sun, Send, Trash2, AlertTriangle, Zap, Lightbulb, Swords, PauseCircle, PlayCircle } from "lucide-react-native";
import { useNotifications } from "@/contexts/NotificationContext";
import { useUserProgress } from "@/contexts/UserProgressContext";
import Colors from "@/constants/colors";

export default function SettingsScreen() {
  const { 
    settings, 
    updateSettings, 
    hasPermission, 
    requestPermissions, 
    behavior, 
    sendImmediateNotification, 
    scheduleSmartNotifications, 
    cancelAllNotifications, 
    scheduledNotifications,
    pauseNotifications,
    unpauseNotifications,
    isNotificationsPaused,
  } = useNotifications();
  const { progress } = useUserProgress();


  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ ...settings, [key]: value });
  };

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const handleTestNotification = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Web Platform',
        'Notifications are not supported on web. Please use the mobile app to test notifications.'
      );
      return;
    }

    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please enable notification permissions first.'
      );
      return;
    }

    await sendImmediateNotification('REWARDS', { 
      achievement: 'Test Achievement',
      level: progress.level,
      xp: 100 
    });

    Alert.alert(
      'Test Notification Sent! 🚀',
      'Check your notification center to see the test notification.'
    );
  };

  const handleScheduleSmartNotifications = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Web Platform',
        'Notifications are not supported on web.'
      );
      return;
    }

    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please enable notification permissions first.'
      );
      return;
    }

    const completedToday = new Date().toISOString().split('T')[0] === behavior.lastActiveTime.split('T')[0];
    await scheduleSmartNotifications(progress.level, progress.streak, completedToday);

    Alert.alert(
      'Smart Notifications Scheduled! 🎯',
      'Notifications have been scheduled based on your behavior and optimal study times.'
    );
  };

  const handleCancelAll = async () => {
    if (Platform.OS === 'web') return;

    Alert.alert(
      'Cancel All Notifications?',
      'This will cancel all scheduled notifications. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Cancel All',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            Alert.alert('Success', 'All notifications have been cancelled.');
          },
        },
      ]
    );
  };

  const handlePauseNotifications = async () => {
    if (Platform.OS === 'web') return;

    Alert.alert(
      'Pausar Notificações',
      'Por quanto tempo você deseja pausar as notificações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '1 Dia',
          onPress: async () => {
            await pauseNotifications(1);
            Alert.alert('Sucesso', 'Notificações pausadas por 1 dia.');
          },
        },
        {
          text: '3 Dias',
          onPress: async () => {
            await pauseNotifications(3);
            Alert.alert('Sucesso', 'Notificações pausadas por 3 dias.');
          },
        },
        {
          text: '1 Semana',
          style: 'destructive',
          onPress: async () => {
            await pauseNotifications(7);
            Alert.alert('Sucesso', 'Notificações pausadas por 1 semana.');
          },
        },
      ]
    );
  };

  const handleUnpauseNotifications = async () => {
    if (Platform.OS === 'web') return;

    await unpauseNotifications();
    Alert.alert('Sucesso', 'Notificações reativadas!');
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Bell size={32} color={Colors.primary} />
          <Text style={styles.title}>Configurações de Notificação</Text>
          <Text style={styles.subtitle}>Personalize suas notificações</Text>
        </View>

        {Platform.OS !== 'web' && !hasPermission && (
          <View style={styles.permissionCard}>
            <BellOff size={24} color={Colors.danger} />
            <Text style={styles.permissionTitle}>Permissão Necessária</Text>
            <Text style={styles.permissionText}>
              Habilite as notificações para receber lembretes e atualizações
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
              <Text style={styles.permissionButtonText}>Habilitar Notificações</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geral</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell size={20} color={Colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Todas as Notificações</Text>
                  <Text style={styles.settingDescription}>
                    Ativar/desativar todas as notificações
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => handleToggle('enabled', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.enabled ? Colors.primary : Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Notificação</Text>
          
          <View style={styles.settingCard}>
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Clock size={20} color={Colors.success} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Lembretes de Estudo</Text>
                  <Text style={styles.settingDescription}>
                    Lembretes diários e streak
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.studyReminders}
                onValueChange={(value) => handleToggle('studyReminders', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.studyReminders ? Colors.primary : Colors.textSecondary}
                disabled={!settings.enabled}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Trophy size={20} color={Colors.coins} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Atualizações Sociais</Text>
                  <Text style={styles.settingDescription}>
                    Ranking e desafios de amigos
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.socialUpdates}
                onValueChange={(value) => handleToggle('socialUpdates', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.socialUpdates ? Colors.primary : Colors.textSecondary}
                disabled={!settings.enabled}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <TrendingUp size={20} color={Colors.primary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Notícias do Mercado</Text>
                  <Text style={styles.settingDescription}>
                    Movimentos importantes do mercado
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.marketNews}
                onValueChange={(value) => handleToggle('marketNews', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.marketNews ? Colors.primary : Colors.textSecondary}
                disabled={!settings.enabled}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <AlertTriangle size={20} color={Colors.danger} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Alertas Urgentes</Text>
                  <Text style={styles.settingDescription}>
                    Movimentos extremos do mercado (&gt;10%)
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.breakingNews}
                onValueChange={(value) => handleToggle('breakingNews', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.breakingNews ? Colors.primary : Colors.textSecondary}
                disabled={!settings.enabled}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Swords size={20} color={Colors.warning} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Desafios de Duelo</Text>
                  <Text style={styles.settingDescription}>
                    Notificações de duelos em tempo real
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.duelChallenges}
                onValueChange={(value) => handleToggle('duelChallenges', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.duelChallenges ? Colors.primary : Colors.textSecondary}
                disabled={!settings.enabled}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingInfo}>
                <Lightbulb size={20} color={Colors.coins} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Insights Personalizados</Text>
                  <Text style={styles.settingDescription}>
                    Progresso semanal e estatísticas
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.personalizedInsights}
                onValueChange={(value) => handleToggle('personalizedInsights', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.personalizedInsights ? Colors.primary : Colors.textSecondary}
                disabled={!settings.enabled}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Trophy size={20} color={Colors.success} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Conquistas</Text>
                  <Text style={styles.settingDescription}>
                    Novas conquistas e recompensas
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.achievements}
                onValueChange={(value) => handleToggle('achievements', value)}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.achievements ? Colors.primary : Colors.textSecondary}
                disabled={!settings.enabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequência & Controle</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.frequencyInfo}>
              <Zap size={20} color={Colors.primary} />
              <Text style={styles.frequencyText}>
                Máximo de notificações por dia
              </Text>
            </View>
            
            <View style={styles.frequencyRow}>
              <TouchableOpacity 
                style={[styles.frequencyButton, settings.maxNotificationsPerDay === 1 && styles.frequencyButtonActive]}
                onPress={() => updateSettings({ ...settings, maxNotificationsPerDay: 1 })}
              >
                <Text style={[styles.frequencyButtonText, settings.maxNotificationsPerDay === 1 && styles.frequencyButtonTextActive]}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.frequencyButton, settings.maxNotificationsPerDay === 2 && styles.frequencyButtonActive]}
                onPress={() => updateSettings({ ...settings, maxNotificationsPerDay: 2 })}
              >
                <Text style={[styles.frequencyButtonText, settings.maxNotificationsPerDay === 2 && styles.frequencyButtonTextActive]}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.frequencyButton, settings.maxNotificationsPerDay === 3 && styles.frequencyButtonActive]}
                onPress={() => updateSettings({ ...settings, maxNotificationsPerDay: 3 })}
              >
                <Text style={[styles.frequencyButtonText, settings.maxNotificationsPerDay === 3 && styles.frequencyButtonTextActive]}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.frequencyButton, settings.maxNotificationsPerDay === 5 && styles.frequencyButtonActive]}
                onPress={() => updateSettings({ ...settings, maxNotificationsPerDay: 5 })}
              >
                <Text style={[styles.frequencyButtonText, settings.maxNotificationsPerDay === 5 && styles.frequencyButtonTextActive]}>5</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.frequencyDescription}>
              Hoje: {behavior.notificationsSentToday}/{settings.maxNotificationsPerDay} enviadas
            </Text>

            <View style={styles.divider} />

            {isNotificationsPaused() ? (
              <TouchableOpacity 
                style={[styles.pauseButton, styles.unpauseButton]}
                onPress={handleUnpauseNotifications}
                disabled={Platform.OS === 'web'}
              >
                <PlayCircle size={20} color={Colors.success} />
                <Text style={[styles.pauseButtonText, { color: Colors.success }]}>
                  Reativar Notificações
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.pauseButton}
                onPress={handlePauseNotifications}
                disabled={Platform.OS === 'web'}
              >
                <PauseCircle size={20} color={Colors.warning} />
                <Text style={styles.pauseButtonText}>
                  Pausar Notificações
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {settings.pausedUntil && (
            <Text style={styles.behaviorNote}>
              ⏸️ Notificações pausadas até {new Date(settings.pausedUntil).toLocaleString('pt-BR')}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horário Silencioso</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.quietHoursInfo}>
              <Moon size={20} color={Colors.primary} />
              <Text style={styles.quietHoursText}>
                Não receber notificações entre
              </Text>
            </View>
            
            <View style={styles.quietHoursRow}>
              <View style={styles.timeBox}>
                <Sun size={16} color={Colors.textSecondary} />
                <Text style={styles.timeText}>{settings.quietHoursStart}</Text>
              </View>
              <Text style={styles.timeArrow}>→</Text>
              <View style={styles.timeBox}>
                <Moon size={16} color={Colors.textSecondary} />
                <Text style={styles.timeText}>{settings.quietHoursEnd}</Text>
              </View>
            </View>

            <Text style={styles.quietHoursDescription}>
              Você não receberá notificações durante este período
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights de Comportamento</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Horários Favoritos</Text>
              <Text style={styles.insightValue}>
                {behavior.optimalStudyHours.map(formatHour).join(', ')}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Sessões Totais</Text>
              <Text style={styles.insightValue}>{behavior.totalSessions}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Taxa de Resposta</Text>
              <Text style={styles.insightValue}>
                {Math.round(behavior.responseRate * 100)}%
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Duração Média</Text>
              <Text style={styles.insightValue}>
                {behavior.averageSessionLength} min
              </Text>
            </View>

            <View style={styles.divider} />
            
            <View style={styles.insightRow}>
              <Text style={styles.insightLabel}>Notificações Ignoradas</Text>
              <Text style={styles.insightValue}>
                {behavior.dismissalCount} ({behavior.consecutiveDismissals} consecutivas)
              </Text>
            </View>
          </View>
          
          <Text style={styles.behaviorNote}>
            💡 Usamos esses dados para enviar notificações nos melhores momentos para você!
          </Text>

          {behavior.consecutiveDismissals >= 2 && (
            <View style={styles.warningCard}>
              <AlertTriangle size={20} color={Colors.warning} />
              <Text style={styles.warningText}>
                Você ignorou {behavior.consecutiveDismissals} notificações consecutivas. 
                {behavior.consecutiveDismissals >= 3 
                  ? ' As notificações foram automaticamente pausadas por 1 semana.'
                  : ' Mais uma e pausaremos as notificações automaticamente.'}
              </Text>
            </View>
          )}
        </View>

        {Platform.OS === 'web' && (
          <View style={styles.webNotice}>
            <Text style={styles.webNoticeText}>
              ℹ️ As notificações push não estão disponíveis na web. Use o app mobile para receber notificações.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testar Notificações</Text>
          
          <View style={styles.settingCard}>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleTestNotification}
              disabled={Platform.OS === 'web' || !hasPermission}
            >
              <Send size={20} color={Colors.surface} />
              <Text style={styles.testButtonText}>Enviar Notificação de Teste</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={[styles.testButton, styles.secondaryButton]}
              onPress={handleScheduleSmartNotifications}
              disabled={Platform.OS === 'web' || !hasPermission}
            >
              <Clock size={20} color={Colors.primary} />
              <Text style={[styles.testButtonText, { color: Colors.primary }]}>Agendar Notificações Inteligentes</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={[styles.testButton, styles.dangerButton]}
              onPress={handleCancelAll}
              disabled={Platform.OS === 'web' || !hasPermission}
            >
              <Trash2 size={20} color={Colors.danger} />
              <Text style={[styles.testButtonText, { color: Colors.danger }]}>Cancelar Todas ({scheduledNotifications.length})</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.behaviorNote}>
            💡 Use essas ferramentas para testar o sistema de notificações e ver como ele funciona!
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  permissionCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.danger + '10',
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.danger,
    marginTop: 12,
  },
  permissionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  permissionButton: {
    marginTop: 16,
    backgroundColor: Colors.danger,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.surface,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  quietHoursInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  quietHoursText: {
    fontSize: 14,
    color: Colors.text,
  },
  quietHoursRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 12,
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  timeArrow: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  quietHoursDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  insightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  insightLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  behaviorNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  webNotice: {
    marginHorizontal: 20,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  webNoticeText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.surface,
  },
  secondaryButton: {
    backgroundColor: Colors.primary + "15",
  },
  dangerButton: {
    backgroundColor: Colors.danger + "15",
  },
  frequencyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  frequencyText: {
    fontSize: 14,
    color: Colors.text,
  },
  frequencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  frequencyButtonActive: {
    backgroundColor: Colors.primary + "15",
    borderColor: Colors.primary,
  },
  frequencyButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  frequencyButtonTextActive: {
    color: Colors.primary,
  },
  frequencyDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  pauseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.warning + "15",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12,
  },
  unpauseButton: {
    backgroundColor: Colors.success + "15",
  },
  pauseButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.warning,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 12,
    backgroundColor: Colors.warning + "10",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + "30",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
});
