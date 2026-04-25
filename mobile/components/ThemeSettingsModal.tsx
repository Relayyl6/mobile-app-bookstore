import { FONTS, LAYOUTS, ReaderSettings, ReaderTheme, SPACINGS, THEMES } from '@/utils/font';
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ThemesSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onSettingsChange: (updated: ReaderSettings) => void;
}

// ─── Defaults (export so parent can initialise state) ─────────────────────────

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineSpacing: 1.5,
  theme: 'original',
  font: 'Georgia',
  brightness: 80,
  pageLayout: 'default',
  autoNightMode: false,
  boldText: false,
  scrollMode: false,
};

const ThemesSettingsModal: React.FC<ThemesSettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'options'>('themes');

  const update = (patch: Partial<ReaderSettings>) =>
    onSettingsChange({ ...settings, ...patch });

  const s = styles(settings.theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={s.overlay}
        activeOpacity={1}
        onPress={onClose}
        >
        <TouchableOpacity
            activeOpacity={1}
            style={s.sheet}
            onPress={() => {}}
        >
          {/* Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Themes &amp; Settings</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={s.tabs}>
            {(['themes', 'options'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === tab && s.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                  {tab === 'themes' ? 'Themes' : 'Options'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

            {activeTab === 'themes' && (
              <>
                {/* Font Size */}
                <View style={s.section}>
                  <Text style={s.sectionLabel}>Text Size</Text>
                  <View style={s.fontSizeRow}>
                    <Text style={[s.fontSizeSample, { fontSize: 14 }]}>A</Text>

                    {/* Stepper bar */}
                    <View style={s.fontStepper}>
                      <TouchableOpacity
                        style={s.stepBtn}
                        onPress={() => update({ fontSize: Math.max(14, settings.fontSize - 1) })}
                      >
                        <Text style={s.stepTxt}>−</Text>
                      </TouchableOpacity>

                      {[14, 16, 18, 20, 22, 24, 26, 28].map((size) => (
                        <TouchableOpacity
                          key={size}
                          style={[s.stepDot, settings.fontSize === size && s.stepDotActive]}
                          onPress={() => update({ fontSize: size })}
                        />
                      ))}

                      <TouchableOpacity
                        style={s.stepBtn}
                        onPress={() => update({ fontSize: Math.min(28, settings.fontSize + 1) })}
                      >
                        <Text style={s.stepTxt}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={[s.fontSizeSample, { fontSize: 22 }]}>A</Text>
                  </View>
                  <Text style={s.sizeValue}>{settings.fontSize}pt</Text>
                </View>

                {/* Divider */}
                <View style={s.divider} />

                {/* Icon row — layout / dark-mode toggle / scroll mode */}
                <View style={s.iconRow}>
                  {/* Page Layout */}
                  {LAYOUTS.map((lay) => (
                    <TouchableOpacity
                      key={lay.value}
                      style={[s.iconBtn, settings.pageLayout === lay.value && s.iconBtnActive]}
                      onPress={() => update({ pageLayout: lay.value })}
                    >
                      <Text style={[s.iconBtnIcon, settings.pageLayout === lay.value && s.iconBtnIconActive]}>
                        {lay.icon}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <View style={s.iconDivider} />

                  {/* Auto Night */}
                  <TouchableOpacity
                    style={[s.iconBtn, settings.autoNightMode && s.iconBtnActive]}
                    onPress={() => update({ autoNightMode: !settings.autoNightMode })}
                  >
                    <Text style={[s.iconBtnIcon, settings.autoNightMode && s.iconBtnIconActive]}>☽</Text>
                  </TouchableOpacity>

                  {/* Scroll mode */}
                  <TouchableOpacity
                    style={[s.iconBtn, settings.scrollMode && s.iconBtnActive]}
                    onPress={() => update({ scrollMode: !settings.scrollMode })}
                  >
                    <Text style={[s.iconBtnIcon, settings.scrollMode && s.iconBtnIconActive]}>↕</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.divider} />

                {/* Theme Grid */}
                <View style={s.section}>
                  <Text style={s.sectionLabel}>Theme</Text>
                  <View style={s.themeGrid}>
                    {THEMES.map((theme) => (
                      <TouchableOpacity
                        key={theme.key}
                        style={[
                          s.themeCard,
                          { backgroundColor: theme.bg },
                          settings.theme === theme.key && {
                            borderColor: theme.border,
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => update({ theme: theme.key })}
                      >
                        <Text style={[s.themeAa, { color: theme.text, fontFamily: settings.font }]}>Aa</Text>
                        <Text style={[s.themeCardLabel, { color: theme.text }]}>{theme.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={s.divider} />

                {/* Font Picker */}
                <View style={s.section}>
                  <Text style={s.sectionLabel}>Font</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.fontScroll}>
                    {FONTS.map((font) => (
                      <TouchableOpacity
                        key={font}
                        style={[s.fontPill, settings.font === font && s.fontPillActive]}
                        onPress={() => update({ font })}
                      >
                        <Text style={[
                          s.fontPillLabel,
                          { fontFamily: font },
                          settings.font === font && s.fontPillLabelActive,
                        ]}>
                          {font}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  {/* Font preview */}
                  <View style={s.fontPreview}>
                    <Text style={[s.fontPreviewText, { fontFamily: settings.font, fontSize: settings.fontSize }]}>
                      The quick brown fox jumps over the lazy dog.
                    </Text>
                  </View>
                </View>
              </>
            )}

            {activeTab === 'options' && (
              <>
                {/* Brightness */}
                <View style={s.section}>
                  <Text style={s.sectionLabel}>Brightness</Text>
                  <View style={s.brightnessRow}>
                    <Text style={s.brightnessIcon}>☼</Text>
                    <View style={s.sliderTrack}>
                      {/* Custom tap-based brightness bar */}
                      {Array.from({ length: 20 }).map((_, i) => {
                        const filled = (i + 1) * 5 <= settings.brightness;
                        return (
                          <TouchableOpacity
                            key={i}
                            style={[s.sliderSegment, filled && s.sliderSegmentFilled]}
                            onPress={() => update({ brightness: (i + 1) * 5 })}
                          />
                        );
                      })}
                    </View>
                    <Text style={[s.brightnessIcon, { fontSize: 22 }]}>☼</Text>
                  </View>
                  <Text style={s.sizeValue}>{settings.brightness}%</Text>
                </View>

                <View style={s.divider} />

                {/* Line Spacing */}
                <View style={s.section}>
                  <Text style={s.sectionLabel}>Line Spacing</Text>
                  <View style={s.spacingRow}>
                    {SPACINGS.map((sp) => (
                      <TouchableOpacity
                        key={sp.value}
                        style={[s.spacingBtn, settings.lineSpacing === sp.value && s.spacingBtnActive]}
                        onPress={() => update({ lineSpacing: sp.value })}
                      >
                        <Text style={[s.spacingBtnLabel, settings.lineSpacing === sp.value && s.spacingBtnLabelActive]}>
                          {sp.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={s.divider} />

                {/* Toggles */}
                <View style={s.section}>
                  <Text style={s.sectionLabel}>Display</Text>

                  <View style={s.toggleRow}>
                    <View>
                      <Text style={s.toggleLabel}>Bold Text</Text>
                      <Text style={s.toggleSub}>Increases font weight throughout</Text>
                    </View>
                    <Switch
                      value={settings.boldText}
                      onValueChange={(v) => update({ boldText: v })}
                      trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <View style={s.divider} />

                  <View style={s.toggleRow}>
                    <View>
                      <Text style={s.toggleLabel}>Scroll Mode</Text>
                      <Text style={s.toggleSub}>Continuous scroll instead of pages</Text>
                    </View>
                    <Switch
                      value={settings.scrollMode}
                      onValueChange={(v) => update({ scrollMode: v })}
                      trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  <View style={s.divider} />

                  <View style={s.toggleRow}>
                    <View>
                      <Text style={s.toggleLabel}>Auto Night Mode</Text>
                      <Text style={s.toggleSub}>Switches to dark theme at night</Text>
                    </View>
                    <Switch
                      value={settings.autoNightMode}
                      onValueChange={(v) => update({ autoNightMode: v })}
                      trackColor={{ false: '#D1D1D6', true: '#007AFF' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Bottom padding */}
            <View style={{ height: 32 }} />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = (theme: ReaderTheme) => {
  const isDark = theme === 'quiet' || theme === 'focus';

  const sheetBg   = isDark ? '#1C1C1E' : '#FFFFFF';
  const textPrim  = isDark ? '#F2F2F7' : '#1C1C1E';
  const textMuted = isDark ? '#8E8E93' : '#6C6C70';
  const border    = isDark ? '#38383A' : '#E5E5EA';
  const activeBg  = isDark ? '#2C2C2E' : '#F2F2F7';
  const accentFg  = '#007AFF';

  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      backgroundColor: sheetBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 8,
      maxHeight: '88%',
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? '#48484A' : '#D1D1D6',
      alignSelf: 'center',
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: textPrim,
    },
    closeBtn: {
      padding: 4,
    },
    closeTxt: {
      fontSize: 16,
      color: textMuted,
    },

    // Tabs
    tabs: {
      flexDirection: 'row',
      marginHorizontal: 20,
      borderRadius: 10,
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      padding: 3,
      marginBottom: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 7,
      borderRadius: 8,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: sheetBg,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: textMuted,
    },
    tabTextActive: {
      color: textPrim,
    },

    body: {
      paddingHorizontal: 20,
    },
    section: {
      paddingVertical: 16,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: textMuted,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: border,
      marginHorizontal: -20,
      paddingHorizontal: 20,
    },

    // Font size
    fontSizeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    fontSizeSample: {
      color: textPrim,
      fontWeight: '400',
      width: 24,
      textAlign: 'center',
    },
    fontStepper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: activeBg,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      gap: 6,
    },
    stepBtn: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepTxt: {
      fontSize: 20,
      color: accentFg,
      lineHeight: 24,
    },
    stepDot: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? '#48484A' : '#D1D1D6',
    },
    stepDotActive: {
      backgroundColor: accentFg,
    },
    sizeValue: {
      fontSize: 12,
      color: textMuted,
      textAlign: 'center',
      marginTop: 6,
    },

    // Icon row
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: activeBg,
      borderRadius: 12,
      padding: 4,
      marginVertical: 12,
      gap: 2,
    },
    iconBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 9,
    },
    iconBtnActive: {
      backgroundColor: sheetBg,
      shadowColor: '#000',
      shadowOpacity: 0.07,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    iconBtnIcon: {
      fontSize: 18,
      color: textMuted,
    },
    iconBtnIconActive: {
      color: textPrim,
    },
    iconDivider: {
      width: StyleSheet.hairlineWidth,
      height: 24,
      backgroundColor: border,
      marginHorizontal: 4,
    },

    // Theme grid
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    themeCard: {
      width: '30%',
      aspectRatio: 1.2,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: border,
    },
    themeAa: {
      fontSize: 22,
      fontWeight: '400',
      marginBottom: 4,
    },
    themeCardLabel: {
      fontSize: 11,
      fontWeight: '500',
    },

    // Font
    fontScroll: {
      marginBottom: 14,
    },
    fontPill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: border,
      marginRight: 8,
      backgroundColor: 'transparent',
    },
    fontPillActive: {
      borderColor: accentFg,
      backgroundColor: isDark ? '#0A2540' : '#EAF4FF',
    },
    fontPillLabel: {
      fontSize: 14,
      color: textMuted,
    },
    fontPillLabelActive: {
      color: accentFg,
    },
    fontPreview: {
      backgroundColor: activeBg,
      borderRadius: 10,
      padding: 14,
    },
    fontPreviewText: {
      color: textPrim,
      lineHeight: 26,
    },

    // Brightness
    brightnessRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brightnessIcon: {
      fontSize: 16,
      color: textMuted,
    },
    sliderTrack: {
      flex: 1,
      flexDirection: 'row',
      gap: 3,
      alignItems: 'center',
    },
    sliderSegment: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? '#48484A' : '#D1D1D6',
    },
    sliderSegmentFilled: {
      backgroundColor: accentFg,
    },

    // Line spacing
    spacingRow: {
      flexDirection: 'row',
      backgroundColor: activeBg,
      borderRadius: 10,
      padding: 3,
      gap: 3,
    },
    spacingBtn: {
      flex: 1,
      paddingVertical: 9,
      alignItems: 'center',
      borderRadius: 8,
    },
    spacingBtnActive: {
      backgroundColor: sheetBg,
    },
    spacingBtnLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: textMuted,
    },
    spacingBtnLabelActive: {
      color: textPrim,
    },

    // Toggles
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    toggleLabel: {
      fontSize: 16,
      color: textPrim,
      fontWeight: '400',
    },
    toggleSub: {
      fontSize: 12,
      color: textMuted,
      marginTop: 2,
    },
  });
};

export default ThemesSettingsModal;