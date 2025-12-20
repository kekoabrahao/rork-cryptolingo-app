# 🧠 Sistema de Notificações Inteligentes com IA - CryptoLingo

## 📋 Visão Geral

O CryptoLingo implementa um sistema avançado de notificações inteligentes que utiliza análise de comportamento do usuário e machine learning (heurísticas) para enviar notificações no momento ideal, maximizando o engajamento e respeitando as preferências do usuário.

## ✨ Funcionalidades Principais

### 1. **Agendamento Inteligente Baseado em Comportamento**

O sistema analisa o comportamento histórico do usuário para determinar:

- ⏰ **Horários Ótimos de Estudo**: Top 3 horários em que o usuário é mais ativo
- 📅 **Dias Preferidos da Semana**: Padrões de atividade por dia
- ⏱️ **Duração Média de Sessão**: Tempo típico que o usuário passa estudando
- 📊 **Taxa de Resposta**: Percentual de notificações abertas vs ignoradas

### 2. **Throttling Inteligente (Limite de Frequência)**

- 🚫 **Limite Diário Configurável**: 1, 2, 3 ou 5 notificações por dia
- 🔄 **Reset Automático**: Contador reinicia à meia-noite
- ⚡ **Exceções para Críticas**: Notificações urgentes (Breaking News, Duelos, Achievements) ignoram o limite
- 📊 **Visualização em Tempo Real**: Usuário vê quantas notificações foram enviadas hoje

### 3. **Sistema de Engagement Tracking**

O sistema rastreia:
- ✅ **Notificações Abertas**: Quando o usuário clica e interage
- ❌ **Notificações Ignoradas (Dismissed)**: Quando o usuário descarta sem abrir
- 🔢 **Dismissals Consecutivos**: Contador de ignoradas em sequência
- 📈 **Taxa de Resposta Global**: Percentual calculado automaticamente

### 4. **Redução Automática de Frequência**

- 🚨 **Trigger**: 3 notificações ignoradas consecutivamente
- ⏸️ **Ação Automática**: Pausa todas as notificações por 7 dias
- 🔔 **Reativação Manual**: Usuário pode reativar a qualquer momento
- ⚠️ **Avisos Progressivos**: Interface mostra avisos aos 2 dismissals

### 5. **Horário Silencioso (Do Not Disturb)**

- 🌙 **Padrão**: 22:00 - 08:00 (10 PM - 8 AM)
- ✏️ **Personalizável**: Usuário pode ajustar início e fim
- 🚫 **Auto-Skip**: Notificações são automaticamente reagendadas para após o horário silencioso
- 🚨 **Exceção Breaking News**: Com opt-in, notícias urgentes podem passar

### 6. **Pausa de Notificações**

Usuário pode pausar notificações por:
- 1 dia
- 3 dias  
- 1 semana

Durante a pausa:
- 🔕 Todas as notificações são bloqueadas
- 📅 Data de reativação é exibida
- ▶️ Botão de reativação manual disponível

---

## 📬 Tipos de Notificação

### 1. **STUDY_REMINDER** 📚
**Lembretes de Estudo**
- **Trigger**: Usuário não estudou hoje
- **Timing**: Horário ótimo do usuário (primary)
- **Prioridade**: Alta
- **Templates**: 8 variações diferentes

### 2. **SOCIAL_COMPETITIVE** 🏆
**Atualizações Competitivas**
- **Trigger**: Mudanças no ranking, amigos ativos
- **Timing**: Horário secundário (evening)
- **Prioridade**: Média
- **Condicional**: Apenas para usuários com taxa de resposta > 50% e nível ≥ 3

### 3. **MARKET_NEWS** 📊
**Notícias do Mercado**
- **Trigger**: Movimento de mercado ≥ 5%
- **Timing**: Horário de mercado (6 AM - 10 PM)
- **Prioridade**: Baixa

### 4. **BREAKING_NEWS** 🚨 *(NOVO)*
**Alertas Urgentes de Mercado**
- **Trigger**: Movimento extremo ≥ 10%
- **Timing**: Imediato
- **Prioridade**: Crítica
- **Bypass**: Ignora limite diário e horário silencioso (com opt-in)

### 5. **DUEL_CHALLENGE** ⚔️ *(NOVO)*
**Desafios de Duelo em Tempo Real**
- **Trigger**: Outro usuário inicia um duelo
- **Timing**: Imediato
- **Prioridade**: Alta
- **Bypass**: Ignora limite diário

### 6. **PERSONALIZED_INSIGHT** 💡 *(NOVO)*
**Insights Personalizados de Progresso**
- **Trigger**: Semanal, baseado em progresso
- **Timing**: Horário terciário (menos crítico)
- **Prioridade**: Baixa
- **Dados**: Lições faltantes, percentil, tópicos fortes/fracos

### 7. **REWARDS** 🎁
**Recompensas e Bônus**
- **Trigger**: Mystery boxes, XP duplo, ofertas
- **Timing**: Imediato
- **Prioridade**: Alta

### 8. **STREAK_DANGER** 🔥
**Risco de Perder Streak**
- **Trigger**: Faltam ≤ 4 horas para meia-noite e usuário não estudou
- **Timing**: 30 minutos antes do fim do dia
- **Prioridade**: Crítica

### 9. **CHALLENGE_AVAILABLE** 🎯
**Novos Desafios Diários**
- **Trigger**: Novo desafio diário disponível
- **Timing**: 9 AM do dia seguinte
- **Prioridade**: Média

### 10. **ACHIEVEMENT_UNLOCKED** 🏆
**Conquistas Desbloqueadas**
- **Trigger**: Usuário desbloqueia achievement
- **Timing**: Imediato
- **Prioridade**: Alta
- **Bypass**: Ignora limite diário

---

## 🤖 Algoritmo de Machine Learning (Heurística)

### Análise de Horários Ótimos

```typescript
// Rastreia horários em que o usuário inicia sessões
optimalStudyHours: [18, 19, 20] // Top 3 horários mais frequentes

// Atualização dinâmica
if (currentHour not in optimalStudyHours) {
  optimalStudyHours = [currentHour, ...optimalStudyHours].slice(0, 3);
}
```

### Cálculo de Horário Ótimo para Notificação

```typescript
getOptimalNotificationTime(priority: 'primary' | 'secondary' | 'tertiary'): Date {
  // Primary: usa o horário #1 mais comum
  // Secondary: usa o horário #2
  // Tertiary: usa o horário #3 ou fallback para 9 AM
  
  // Se o horário já passou hoje, agenda para amanhã
  // Se cair em horário silencioso, agenda para após o fim do quiet hours
}
```

### Taxa de Resposta

```typescript
responseRate = notificaçõesAbertas / notificaçõesEnviadas

// Exemplo: 8 abertas de 10 enviadas = 80% de taxa de resposta
```

### Decisão de Agendamento Inteligente

```typescript
scheduleSmartNotifications(userLevel, streak, completedToday) {
  // 1. Se não completou hoje
  if (!completedToday) {
    // Horário específico baseado no contexto
    if (hora >= 19 && hora <= 22) {
      // Evening reminder - 15 min
    } else if (isWeekend && hora >= 10 && hora <= 12) {
      // Weekend reminder - 30 min
    } else {
      // Usar horário ótimo do usuário
    }
  }
  
  // 2. Streak em risco
  if (streak > 0 && !completedToday && hora >= 20) {
    scheduleStreakReminder();
  }
  
  // 3. Social competitive (apenas high-engagement)
  if (responseRate > 0.5 && userLevel >= 3) {
    if (Math.random() > 0.7) { // 30% chance
      scheduleSocialCompetitiveNotification();
    }
  }
}
```

---

## 🛡️ Privacidade & Respeito ao Usuário

### Políticas de Privacidade

1. **Horário Silencioso Respeitado**: 22:00 - 08:00 (padrão)
2. **Limite Diário**: Máximo 3 notificações/dia (padrão)
3. **Redução Automática**: 3 dismissals consecutivos = pause 7 dias
4. **Pausa Manual**: Usuário pode pausar por 1, 3 ou 7 dias
5. **Opt-in Breaking News**: Notificações urgentes fora do horário requerem permissão

### Transparência

- Usuário vê quantas notificações foram enviadas hoje
- Taxa de resposta é exibida nas configurações
- Avisos progressivos antes da pausa automática
- Data de reativação sempre visível quando pausado

---

## 🔧 Implementação Técnica

### Contexto Principal

**Arquivo**: `contexts/NotificationContext.tsx`

Funções principais:
- `scheduleSmartNotifications()`: Orquestra todas as notificações inteligentes
- `scheduleNotification()`: Agenda uma notificação específica
- `sendImmediateNotification()`: Envia notificação instantânea
- `pauseNotifications()`: Pausa por N dias
- `canSendNotificationToday()`: Verifica limite diário
- `trackNotificationResponse()`: Rastreia engagement
- `isQuietHours()`: Verifica horário silencioso

### Storage

Dados armazenados em `AsyncStorage`:
- `@cryptolingo_notification_settings`: Configurações do usuário
- `@cryptolingo_user_behavior`: Padrões de comportamento
- `@cryptolingo_scheduled_notifications`: Notificações agendadas

### UI de Configurações

**Arquivo**: `app/(tabs)/settings.tsx`

Seções:
1. **Geral**: Ativar/desativar todas as notificações
2. **Tipos de Notificação**: 10 toggles individuais
3. **Frequência & Controle**: Limite diário (1/2/3/5) + botão de pausa
4. **Horário Silencioso**: Visualização de quiet hours
5. **Insights de Comportamento**: Métricas de engagement
6. **Testar Notificações**: Ferramentas de debug

---

## 📊 Métricas & Analytics

### Eventos Rastreados

```typescript
// Em analytics.ts
trackNotificationReceived(type, delivered)
trackNotificationOpened(type, timeToOpen)

// Em NotificationContext
- Notification received
- Notification opened
- Notification dismissed
- Daily limit reached
- Auto-pause triggered
- Manual pause/unpause
```

### KPIs do Sistema

- **Taxa de Abertura Global**: % de notificações abertas
- **Taxa de Dismissal**: % de notificações ignoradas
- **Dismissals Consecutivos**: Indicador de satisfação
- **Notificações/Dia**: Frequência real vs limite
- **Horários Ótimos**: Distribuição de atividade

---

## 🧪 Testing & Debug

### Ferramentas na UI

1. **Enviar Notificação de Teste**: Teste imediato
2. **Agendar Notificações Inteligentes**: Simula o algoritmo completo
3. **Cancelar Todas**: Limpa todas as notificações agendadas

### Console Logs

Todos os eventos importantes são logados:
- ✅ Notification scheduled/sent
- ⚠️ Daily limit reached
- ⚠️ Quiet hours skip
- 🔕 Notifications paused
- 🔔 Notifications unpaused

### Expo Go vs Development Build

⚠️ **IMPORTANTE**: No Expo Go (SDK 53+), notificações são desabilitadas automaticamente.

Para testar notificações, use:
```bash
# Development Build
npx expo run:ios
# ou
npx expo run:android

# Production Build
eas build --platform ios
eas build --platform android
```

---

## 🚀 Próximos Passos & Melhorias Futuras

### Funcionalidades Planejadas

1. **A/B Testing**: Testar diferentes tempos de envio
2. **ML Avançado**: TensorFlow.js para predição de horários
3. **Personalização de Templates**: Usuário escolhe estilo de mensagem
4. **Rich Notifications**: Imagens, ações inline (iOS)
4. **Notification History**: Histórico completo de notificações
5. **Granular Quiet Hours**: Diferentes horários por dia da semana
6. **Geolocalização**: Ajuste de timezone automático

### Otimizações

1. **Batch Scheduling**: Agendar múltiplas notificações de uma vez
2. **Cache de Templates**: Reduzir lookups
3. **Background Refresh**: Atualizar comportamento em background
4. **Push Notification Backend**: Integrar com Firebase/OneSignal

---

## 📚 Recursos & Documentação

### Arquivos Relevantes

```
/contexts/NotificationContext.tsx     # Contexto principal
/types/notification.ts                # TypeScript interfaces
/data/notification-templates.ts       # Templates de mensagens
/app/(tabs)/settings.tsx              # UI de configurações
/utils/analytics.ts                   # Analytics tracking
```

### Dependências

- `expo-notifications`: Sistema de notificações nativo
- `@react-native-async-storage/async-storage`: Persistência
- `expo-constants`: Detecção de ambiente (Expo Go)

### Links Úteis

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [iOS Background Modes](https://developer.apple.com/documentation/usernotifications)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)

---

## 🏆 Conclusão

O sistema de notificações inteligentes do CryptoLingo é um dos mais avançados em aplicativos educacionais, equilibrando:

✅ **Engajamento**: Notificações nos melhores momentos  
✅ **Privacidade**: Respeito total ao usuário  
✅ **Inteligência**: ML e análise de comportamento  
✅ **Transparência**: Métricas e controle total  
✅ **Flexibilidade**: 10 tipos diferentes de notificações  

**Status**: ✅ **PRODUÇÃO PRONTO** (requer development/production build para funcionar)

---

*Última atualização: 20 de Dezembro de 2024*  
*Versão: 2.0 - AI-Powered Smart Notifications*
