import { StyleSheet } from 'react-native';

export const modalFormStyles = StyleSheet.create({
  // Common modal container styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
    minHeight: '60%',
    shadowColor: '#000',
    width: '90%',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center'
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    color: '#333',
    lineHeight: 24
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#f9f9f9'
  },
  input_text: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'center'
  },
  section: {
    marginBottom: 24
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
    width: '100%'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  addButton: {
    padding: 6
  },
  addButtonText: {
    color: '#007AFF',
    fontWeight: '500'
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  stepNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 5
  },
  stepInput: {
    flex: 1,
    marginRight: 8
  },
  skillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  skillInput: {
    flex: 1,
    marginRight: 8
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center'
  },
  buttonCancel: {
    backgroundColor: '#cdcdcdff'
  },
  buttonSave: {
    backgroundColor: '#EC1D25'
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  editButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#007AFF',
    padding: 6,
    borderRadius: 12
  },
  editButtonText: {
    color: 'white',
    fontSize: 12
  },
  // for generate_regimen_modal
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4
  },
  // general list items
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribute space between text and checkbox
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  selectedListItem: {
    backgroundColor: '#fff5f5' // Light tint for selected items
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  }
});

export default modalFormStyles;
