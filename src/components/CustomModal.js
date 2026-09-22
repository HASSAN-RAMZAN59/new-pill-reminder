import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';

const CustomModal = ({ visible, onClose, title, message, options }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.dialogContainer}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {message ? <Text style={styles.message}>{message}</Text> : null}
            
            <View style={styles.optionsContainer}>
              {options.map((option, index) => {
                let btnStyle = styles.primaryBtn;
                let textStyle = styles.primaryText;
                
                if (option.style === 'cancel') {
                  btnStyle = styles.cancelBtn;
                  textStyle = styles.cancelText;
                } else if (option.style === 'destructive') {
                  btnStyle = styles.destructiveBtn;
                  textStyle = styles.destructiveText;
                } else if (option.style === 'outline') {
                  btnStyle = styles.outlineBtn;
                  textStyle = styles.outlineText;
                }

                return (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.optionBtn, btnStyle]} 
                    onPress={() => {
                      onClose();
                      if (option.onPress) option.onPress();
                    }}
                  >
                    <Text style={[styles.optionText, textStyle]}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: '#E0F2FE',
  },
  primaryText: {
    color: '#0285FF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveBtn: {
    backgroundColor: '#FCE8E8',
  },
  destructiveText: {
    color: '#BA1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  outlineText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default CustomModal;
