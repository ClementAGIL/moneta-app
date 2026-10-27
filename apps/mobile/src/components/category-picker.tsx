// Bottom sheet listing the categories (children indented) plus "uncategorized".
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import type { Category } from '@moneta/shared';

import { Body, Dot } from '@/components/ui';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

interface Props {
  visible: boolean;
  categories: Category[];
  selected: string;
  onPick(categoryId: string): void;
  onClose(): void;
}

export function CategoryPicker({ visible, categories, selected, onPick, onClose }: Props) {
  const { colors, radius } = useTheme();
  const items = [{ id: '', name: strings.common.uncategorized, parentId: null, color: undefined }, ...categories];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
        ]}
      >
        <FlatList
          data={items}
          keyExtractor={(c) => c.id || 'none'}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onPick(item.id)}
              style={[
                styles.item,
                {
                  paddingLeft: item.parentId ? 36 : 16,
                  backgroundColor: item.id === selected ? colors.background : undefined,
                },
              ]}
            >
              <Dot color={item.color} />
              <Body style={{ fontWeight: item.parentId ? '400' : '600' }}>{item.name}</Body>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { maxHeight: '70%', paddingVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingRight: 16 },
});
