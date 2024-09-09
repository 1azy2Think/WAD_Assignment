import {StyleSheet} from 'react-native';

export const popUpBox = StyleSheet.create({
  forgotPasswordText: {
    color: '#007BFF',
    textDecorationLine: 'underline',
    marginVertical: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: 15,
    color: 'gray',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b7b7b7',
    borderRadius: 5,
    width: '100%',
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  confirmButton: {
    backgroundColor: '#F26419',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
});

export const loginSignUp = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fce7cc', 
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  logo: {
    marginBottom: 40,
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    borderRadius: 8,
    height: 50, // Increased height for better usability
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 10,
  },
  requirements: {
    marginTop: 5,
    color: '#888',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center', // Center the buttons horizontally
    marginTop: 20,
  },
  button: {
    width: '80%', // Make the button width responsive
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f26419',
    marginBottom: 15, // Space between buttons
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default loginSignUp;



export const newPost = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce7cc',
  },
  inputContainer: {
    padding: 20,
  },
  recipePicture: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#ddd',
    borderWidth: 2,
    borderColor: 'gray',
  },
  defaultRecipePicture: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'gray',
  },
  editButton: {
    position: 'absolute',
    backgroundColor: 'rgba(128,128,128,0.7)',
    borderRadius: 15,
    padding: 5,
    top: '41.5%',
    left: '43.5%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  flexItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdown: {
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 8,
    paddingVertical: 0,
    backgroundColor: '#f6f6f6',
  },
  buttonContainer: {
    marginTop: 10,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F26419',
    height: 40,
  },
  headerInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EBEBEB',
    marginHorizontal: 10,
  },
});
