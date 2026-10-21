import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useThemeStore } from '../../store/useThemeStore';
import { getTheme } from '../../theme/theme';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface DateTimePickerModalProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  label,
  value,
  onChange,
}) => {
  const isDark = useThemeStore((s) => s.isDark);
  const theme = getTheme(isDark);

  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState<boolean>(false);

  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (event.type === 'set' && selectedDate) {
      if (mode === 'date') {
        // Keep existing time, update date parts
        const updated = new Date(value);
        updated.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        onChange(updated);
      } else {
        // Keep existing date, update time parts
        const updated = new Date(value);
        updated.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
        onChange(updated);
      }
    }
  };

  const openPicker = (pickerMode: 'date' | 'time') => {
    setMode(pickerMode);
    setShow(true);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, theme.typography.captionBold, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>

      <View style={styles.buttonRow}>
        {/* Date Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openPicker('date')}
          style={[
            styles.pickBtn,
            {
              backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={styles.btnIcon}>📅</Text>
          <Text style={[styles.btnText, { color: theme.colors.text }]}>
            {formatDate(value)}
          </Text>
        </TouchableOpacity>

        {/* Time Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openPicker('time')}
          style={[
            styles.pickBtn,
            {
              backgroundColor: isDark ? theme.colors.card : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={styles.btnIcon}>⏰</Text>
          <Text style={[styles.btnText, { color: theme.colors.text }]}>
            {formatTime(value)}
          </Text>
        </TouchableOpacity>
      </View>

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={false}
          display="default"
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginHorizontal: 4,
  },
  btnIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
