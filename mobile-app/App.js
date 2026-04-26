import React, { useState, useEffect } from 'react';
import {
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import GradientButton from './components/GradientButton';
import StatusBadge from './components/StatusBadge';
import { uploadImage, verifyImage, fetchHistory, loginUser } from './services/api';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempPass, setTempPass] = useState('');
  const [showUserModal, setShowUserModal] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (activeTab === 'history' && username) {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await fetchHistory(username);
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSetUsername = async () => {
    if (tempName.trim().length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    if (tempPass.trim().length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }
    
    setLoading(true);
    try {
      await loginUser(tempName.trim(), tempPass.trim());
      setUsername(tempName.trim());
      setPassword(tempPass.trim());
      setShowUserModal(false);
    } catch (error) {
      Alert.alert('Authentication Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      // Ask for write-only permission to avoid the Audio requirement on Android 13+
      const { status: libStatus } = await MediaLibrary.requestPermissionsAsync(true);

      if (camStatus !== 'granted') {
        Alert.alert('Camera Permission', 'Please enable camera access in your phone settings to take photos.');
        return;
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8, // Slightly lower quality for faster processing
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const uri = pickerResult.assets[0].uri;
        setImage(uri);
        setResult(null);

        // Save to gallery if permitted
        if (libStatus === 'granted') {
          try {
            await MediaLibrary.saveToLibraryAsync(uri);
          } catch (e) {
            console.log("Gallery save skipped:", e.message);
          }
        }
      }
    } catch (error) {
      console.error("Camera Error:", error);
      Alert.alert('Camera Error', error.message || 'Could not open camera');
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
    } catch {
      return null;
    }
  };

  const handleVerify = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const data = await verifyImage(image);
      setResult(data);
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        'Could not connect to the RealityShield backend. Check server IP.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const coords = await getLocation();
      setLocation(coords);

      const data = await uploadImage(image, username, password, coords);
      const locStr = coords ? `\n📍 ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : '';
      
      Alert.alert(
        'Identity Locked! 🛡️',
        `Image proof stored on Blockchain.\n${locStr}\n\nTX: ${data.blockchainTx?.substring(0, 20)}...`
      );
      setResult(null);
      setImage(null);
      loadHistory(); // Refresh history
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} style={StyleSheet.absoluteFill} />

      <View style={styles.mainContainer}>
        {activeTab === 'home' && (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Premium Header */}
            <View style={styles.header}>
              <LinearGradient 
                colors={['rgba(129, 140, 248, 0.2)', 'transparent']} 
                style={styles.headerBlur} 
              />
              <View style={styles.logoRow}>
                <Image 
                  source={require('./assets/images/logo.png')} 
                  style={styles.headerLogo}
                  resizeMode="contain"
                />
                <Text style={styles.logoText}>RealityShield</Text>
              </View>
              <Text style={styles.tagline}>Decentralized Proof of Authenticity</Text>
            </View>

            {/* Glass Card */}
            <View style={styles.glassCard}>
              {image ? (
                <View style={styles.imageContainer}>
                  <ExpoImage
                    source={{ uri: image }}
                    style={styles.preview}
                    contentFit="cover"
                    transition={300}
                  />
                  <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.5)']} 
                    style={styles.imageOverlay} 
                  />
                  <TouchableOpacity style={styles.retakeBtn} onPress={takePhoto}>
                    <Ionicons name="camera-reverse" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.cameraPlaceholder} onPress={takePhoto}>
                  <View style={styles.innerPlaceholder}>
                    <Ionicons name="camera" size={64} color="#818cf8" />
                    <Text style={styles.placeholderTitle}>Capture Secure Photo</Text>
                    <Text style={styles.placeholderSub}>Camera only mode for maximum integrity</Text>
                  </View>
                </TouchableOpacity>
              )}

              {image && !result && (
                <View style={styles.actionSection}>
                  <GradientButton
                    title="Verify Authenticity"
                    iconName="shield-checkmark-outline"
                    loading={loading}
                    onPress={handleVerify}
                    colors={['#6366f1', '#4f46e5']}
                    style={styles.verifyBtn}
                  />
                </View>
              )}

              {result && (
                <View style={styles.resultContainer}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultHeading}>Analysis Result</Text>
                    <StatusBadge status={result.status} />
                  </View>

                  <View style={styles.confidenceRow}>
                    <View style={styles.confItem}>
                      <Text style={styles.confLabel}>CONFIDENCE</Text>
                      <Text style={[styles.confValue, { color: result.status === 'authentic' ? '#10b981' : '#f59e0b' }]}>
                        {result.confidence}%
                      </Text>
                    </View>
                    <View style={styles.confDivider} />
                    <View style={styles.confItem}>
                      <Text style={styles.confLabel}>VERDICT</Text>
                      <Text style={styles.confValueSmall}>{result.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <Text style={styles.reasonText}>{result.reason || 'Image analyzed against global registry.'}</Text>

                  {result.status === 'unknown' && (
                    <View style={styles.protectSection}>
                      <View style={styles.infoLine}>
                        <Ionicons name="alert-circle-outline" size={16} color="#94a3b8" />
                        <Text style={styles.infoText}> This image is not yet registered.</Text>
                      </View>
                      <GradientButton
                        title="Secure on Blockchain"
                        iconName="lock-closed"
                        onPress={handleRegister}
                        loading={loading}
                        colors={['#10b981', '#059669']}
                      />
                    </View>
                  )}

                  <TouchableOpacity style={styles.resetBtn} onPress={resetAll}>
                    <Text style={styles.resetBtnText}>Clear & Reset</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.securityInfo}>
              <View style={styles.secItem}>
                <Ionicons name="finger-print" size={16} color="#475569" />
                <Text style={styles.secText}> SHA-256</Text>
              </View>
              <View style={styles.secItem}>
                <Ionicons name="cube-outline" size={16} color="#475569" />
                <Text style={styles.secText}> IPFS</Text>
              </View>
              <View style={styles.secItem}>
                <Ionicons name="location-outline" size={16} color="#475569" />
                <Text style={styles.secText}> GPS</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContainer}>
            <View style={styles.tabHeaderPremium}>
              <Text style={styles.tabTitlePremium}>Vault</Text>
              <Text style={styles.tabSubPremium}>{history.length} Secure Records</Text>
            </View>
            
            <FlatList
              data={history}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.historyCardPremium}
                  onPress={() => Linking.openURL(`https://ipfs.io/ipfs/${item.cid}`)}
                >
                  <ExpoImage 
                    source={{ uri: `https://ipfs.io/ipfs/${item.cid}` }} 
                    style={styles.historyImg}
                    contentFit="cover"
                  />
                  <View style={styles.historyContent}>
                    <Text style={styles.historyDateText}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                    <Text style={styles.historyIdText}>CID: {item.cid.substring(0, 12)}...</Text>
                    {item.latitude && (
                      <View style={styles.locRow}>
                        <Ionicons name="location" size={10} color="#818cf8" />
                        <Text style={styles.locText}> {parseFloat(item.latitude).toFixed(3)}, {parseFloat(item.longitude).toFixed(3)}</Text>
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#334155" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="cube-outline" size={80} color="#1e293b" />
                  <Text style={styles.emptyTitle}>Vault is Empty</Text>
                  <Text style={styles.emptySub}>Capture your first proof to see it here.</Text>
                </View>
              }
            />
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={styles.tabContainer}>
            <View style={styles.profileHero}>
              <LinearGradient 
                colors={['#818cf8', '#6366f1']} 
                style={styles.avatarCircle}
              >
                <Text style={styles.avatarText}>{username.substring(0, 2).toUpperCase()}</Text>
              </LinearGradient>
              <Text style={styles.profileUser}>{username}</Text>
              <View style={styles.nodeBadge}>
                <Ionicons name="planet" size={14} color="#10b981" />
                <Text style={styles.nodeText}> Active Validator Node</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{history.length}</Text>
                <Text style={styles.statDesc}>Assets Secured</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>100%</Text>
                <Text style={styles.statDesc}>Integrity</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.idChangeBtn} 
              onPress={() => setShowUserModal(true)}
            >
              <Ionicons name="swap-horizontal" size={20} color="#94a3b8" />
              <Text style={styles.idChangeText}>Switch Identity</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modern Bottom Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setActiveTab('home')}>
          <Ionicons name={activeTab === 'home' ? 'scan' : 'scan-outline'} size={26} color={activeTab === 'home' ? '#818cf8' : '#475569'} />
          <Text style={[styles.navBtnText, activeTab === 'home' && styles.navBtnActive]}>Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navBtn} onPress={() => setActiveTab('history')}>
          <Ionicons name={activeTab === 'history' ? 'briefcase' : 'briefcase-outline'} size={26} color={activeTab === 'history' ? '#818cf8' : '#475569'} />
          <Text style={[styles.navBtnText, activeTab === 'history' && styles.navBtnActive]}>Vault</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setActiveTab('profile')}>
          <Ionicons name={activeTab === 'profile' ? 'person' : 'person-outline'} size={26} color={activeTab === 'profile' ? '#818cf8' : '#475569'} />
          <Text style={[styles.navBtnText, activeTab === 'profile' && styles.navBtnActive]}>Identity</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <Modal visible={showUserModal} transparent animationType="fade">
        <View style={styles.modalBlur}>
          <LinearGradient colors={['#0f172a', '#020617']} style={styles.authCard}>
            <View style={styles.authHeader}>
              <View style={styles.authIconBg}>
                <Ionicons name="key" size={30} color="#818cf8" />
              </View>
              <Text style={styles.authTitle}>Initialize RealityShield</Text>
              <Text style={styles.authSub}>Enter credentials to access the decentralized protocol.</Text>
            </View>
            
            <TextInput
              style={styles.authInput}
              placeholder="Unique Username"
              placeholderTextColor="#334155"
              value={tempName}
              onChangeText={setTempName}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.authInput}
              placeholder="Private Password"
              placeholderTextColor="#334155"
              value={tempPass}
              onChangeText={setTempPass}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.authSubmit} onPress={handleSetUsername} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.authSubmitText}>Establish Link</Text>}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  mainContainer: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 100 },
  header: { alignItems: 'center', marginVertical: 30, position: 'relative' },
  headerBlur: { position: 'absolute', top: -50, width: 200, height: 200, borderRadius: 100 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  headerLogo: { width: 44, height: 44, marginRight: 8 },
  logoText: { fontSize: 32, fontWeight: '900', color: '#fff', marginLeft: 4, letterSpacing: -1 },
  tagline: { color: '#475569', fontSize: 13, fontWeight: '600' },
  
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  
  cameraPlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(129, 140, 248, 0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerPlaceholder: { alignItems: 'center', gap: 10 },
  placeholderTitle: { color: '#f8fafc', fontSize: 20, fontWeight: '700' },
  placeholderSub: { color: '#64748b', fontSize: 12, textAlign: 'center', paddingHorizontal: 40 },
  
  imageContainer: { width: '100%', height: 350, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  preview: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  retakeBtn: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 12 },
  
  actionSection: { marginTop: 24 },
  verifyBtn: { height: 60, borderRadius: 18 },
  
  resultContainer: { marginTop: 10 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  resultHeading: { fontSize: 18, fontWeight: '800', color: '#fff' },
  
  confidenceRow: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(2, 6, 23, 0.5)', 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center',
    marginBottom: 20
  },
  confItem: { flex: 1, alignItems: 'center' },
  confDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  confLabel: { color: '#475569', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  confValue: { fontSize: 28, fontWeight: '900' },
  confValueSmall: { fontSize: 16, fontWeight: '800', color: '#fff' },
  
  reasonText: { color: '#94a3b8', textAlign: 'center', fontSize: 13, lineHeight: 20, marginBottom: 25 },
  
  protectSection: { 
    backgroundColor: 'rgba(16, 185, 129, 0.05)', 
    borderRadius: 20, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 15
  },
  infoLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  infoText: { color: '#94a3b8', fontSize: 12 },
  
  resetBtn: { alignSelf: 'center', padding: 10 },
  resetBtnText: { color: '#475569', fontSize: 14, fontWeight: '600' },

  securityInfo: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 30 },
  secItem: { flexDirection: 'row', alignItems: 'center' },
  secText: { color: '#334155', fontSize: 11, fontWeight: '700' },

  tabContainer: { flex: 1, paddingTop: 60 },
  tabHeaderPremium: { paddingHorizontal: 25, marginBottom: 20 },
  tabTitlePremium: { fontSize: 34, fontWeight: '900', color: '#fff' },
  tabSubPremium: { color: '#818cf8', fontSize: 14, fontWeight: '600' },
  
  historyCardPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  historyImg: { width: 60, height: 60, borderRadius: 14 },
  historyContent: { flex: 1, marginLeft: 15 },
  historyDateText: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 2 },
  historyIdText: { color: '#475569', fontSize: 11, fontFamily: 'monospace' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locText: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, opacity: 0.5 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 15 },
  emptySub: { color: '#475569', fontSize: 14, marginTop: 5 },

  profileHero: { alignItems: 'center', marginTop: 20 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', elevation: 20 },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  profileUser: { fontSize: 26, fontWeight: '800', color: '#fff', marginTop: 15 },
  nodeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  nodeText: { color: '#10b981', fontSize: 12, fontWeight: '700' },
  
  statsGrid: { flexDirection: 'row', padding: 25, gap: 15 },
  statCard: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statNum: { fontSize: 24, fontWeight: '900', color: '#fff' },
  statDesc: { color: '#64748b', fontSize: 11, fontWeight: '700', marginTop: 2 },
  
  idChangeBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 8, marginTop: 20 },
  idChangeText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },

  navBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    paddingBottom: 35,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navBtn: { flex: 1, alignItems: 'center' },
  navBtnText: { color: '#475569', fontSize: 10, marginTop: 4, fontWeight: '700' },
  navBtnActive: { color: '#818cf8' },

  modalBlur: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 25 },
  authCard: { borderRadius: 40, padding: 35, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  authHeader: { alignItems: 'center', marginBottom: 30 },
  authIconBg: { backgroundColor: 'rgba(129, 140, 248, 0.1)', padding: 20, borderRadius: 25, marginBottom: 20 },
  authTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 10 },
  authSub: { color: '#475569', textAlign: 'center', fontSize: 14, lineHeight: 20 },
  authInput: { backgroundColor: 'rgba(2, 6, 23, 0.5)', padding: 18, borderRadius: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 15 },
  authSubmit: { backgroundColor: '#818cf8', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  authSubmitText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
