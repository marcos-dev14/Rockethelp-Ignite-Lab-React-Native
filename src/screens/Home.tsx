import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { HStack, IconButton, VStack, useTheme, Text, Heading, FlatList, Center } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { ChatTeardropText, SignOut } from 'phosphor-react-native';

import { dateFormat } from '../utils/firestoreDateFormat';

import Logo from '../assets/logo_secondary.svg';

import { Filter } from '../components/Filter';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { Order, OrderDataProps } from '../components/Order';

export function Home() {
  const [loading, setLoading] = useState(true);
  const [statusSelected, setStatusSelected] = useState<'open' | 'closed'>('open');
  const [orders, setOrders] = useState<OrderDataProps[]>([]);

  const { colors } = useTheme();

  const navigation = useNavigation()

  function handleNewOrder() {
    navigation.navigate('new');
  }

  function handleOpenDetails(orderId: string) {
    navigation.navigate('details', { orderId });
  }

  function handleLogout() {
    auth()
      .signOut()
      .catch(error => {
        console.log(error);
        return Alert.alert('Sair', 'Não possível sair.')
      });
  }

  useEffect(() => {
    setLoading(true);

    const subscriber = firestore()
      .collection('orders')
      .where('status', '==', statusSelected)
      .onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => {
          const { patrimony, description, status, created_at } = doc.data();

          return {
            id: doc.id,
            patrimony,
            description,
            status,
            when: dateFormat(created_at)
          }
        })

        setOrders(data);
        setLoading(false);
      })

      return subscriber;

  },[statusSelected])

  return (
    <VStack flex={1} pb={6} bg="gray.700">
      <HStack 
        w="full"
        alignItems="center"
        justifyContent="space-between"
        bg="gray.600"
        pt={12}
        pb={5}
        px={6}
      >
        <Logo />

        <IconButton 
          icon={<SignOut size={26} color={colors.gray[300]} />}
          onPress={handleLogout}
        />
      </HStack>

      <VStack flex={1} px={6}>
        <HStack
          w="full"
          mt={8}
          mb={4}
          alignContent="center"
          justifyContent="space-between"
        >
          <Heading color="gray.100">Solicitações</Heading>
          <Text color="gray.200">
            {orders.length}
          </Text>
        </HStack>

        <HStack space={3} mb={8}>
          <Filter
            type="open"
            title="em andamento"
            onPress={() => setStatusSelected('open')}
            isActive={statusSelected === 'open'}
          />

          <Filter
            type="closed"
            title="finalizado"
            onPress={() => setStatusSelected('closed')}
            isActive={statusSelected === 'closed'}
          />
        </HStack>

        {
          loading 
            ? <Loading /> 
            : <FlatList 
                data={orders}
                keyExtractor={item => item.id}
                renderItem={({item}) => <Order data={item} onPress={() => handleOpenDetails(item.id)} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={() => (
                  <Center>
                    <ChatTeardropText size={40} color={colors.gray[400]} />
                    <Text color="gray.300" fontSize="xl" mt={4} textAlign="center">
                      Você ainda não possui {'\n'}
                      solicitações {statusSelected === 'open' ? 'em andamento' : 'finalizado'}
                    </Text>
                  </Center>
                )}
              />
        }

        <Button title="Nova solicitação" onPress={handleNewOrder} />
      </VStack>
    </VStack>
  );
}