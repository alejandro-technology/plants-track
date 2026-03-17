// Mock gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    contains: jest.fn(),
  })),
}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => () => ({
  utils: () => ({
    FilePath: {
      PICTURES_DIRECTORY: 'PICTURES_DIRECTORY',
    },
  }),
}));

jest.mock('@react-native-firebase/auth', () => () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  currentUser: null,
}));

jest.mock('@react-native-firebase/firestore', () => () => ({
  collection: jest.fn(),
  doc: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock jail-monkey
jest.mock('jail-monkey', () => ({
  isJailBroken: jest.fn(() => false),
  hookDetected: jest.fn(() => false),
  canMockLocation: jest.fn(() => false),
}));
