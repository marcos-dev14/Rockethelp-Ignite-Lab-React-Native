import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { HStack, Text, VStack, useTheme, ScrollView, Box } from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { CircleWavyCheck, ClipboardText, DesktopTower, Hourglass } from 'phosphor-react-native';

import { dateFormat } from '../utils/firestoreDateFormat';

import { Header } from '../components/Header';
import { OrderDataProps } from '../components/Order';
import { Loading } from '../components/Loading';
import { CardDetails } from '../components/CardDetails';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

import { OrderFirestoreDTO } from '../DTOs/OrderFirestoreDTO';

interface RouteParams {
  orderId: string;
}

interface OrderDetails extends OrderDataProps {
  description: string;
  solution: string;
  closed: string;
}

export function Details() {
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({} as OrderDetails)

  const { colors } = useTheme();

  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as RouteParams;

  function handleOrderClose() {
    if(!solution) {
      return Alert.alert('Solicitação', 'Informe a solução para encerrar a solicitação.');
    }

    firestore()
      .collection<OrderFirestoreDTO>('orders')
      .doc(orderId)
      .update({
        status: 'closed',
        solution,
        closed_at: firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        Alert.alert('Solicitação', 'Solicitação encerrada.')
        navigation.goBack();
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('Solicitação', 'Não foi possível encerrar a solicitação.')
      });
  }

  useEffect(() => {
    firestore()
      .collection<OrderFirestoreDTO>('orders')
      .doc(orderId)
      .get()
      .then((doc) => {
        const { 
          patrimony, 
          description, 
          status, 
          created_at, 
          closed_at, 
          solution 
        } = doc.data();

        const closed = closed_at ? dateFormat(closed_at) : null;

        setOrderDetails({
          id: doc.id,
          patrimony,
          description,
          status,
          solution,
          when: dateFormat(created_at),
          closed
        });
        setLoading(false);
      });
  },[]);

  if (loading) {
    return <Loading />
  }

  return (
    <VStack flex={1} pb={6} bg="gray.700">
      <Box px={6} bg="gray.600">
        <Header title="solicitação" />
      </Box>

      <HStack bg="gray.500" justifyContent="center" p={4}>
        {
          orderDetails.status === 'closed'
            ? <CircleWavyCheck size={22} color={colors.green[300]} />
            : <Hourglass size={22} color={colors.secondary[700]} />
        }

        <Text 
          fontSize="sm"
          color={orderDetails.status === 'closed' ? colors.green[300] : colors.secondary[700]}
          ml={2}
          textTransform="uppercase"
        >
          {orderDetails.status === 'closed' ? 'finalizado' : 'em andamento'}
        </Text>
      </HStack>

      <ScrollView mx={5} showsVerticalScrollIndicator={false}>
        <CardDetails 
          title="equipamento"
          description={`Patrimônio ${orderDetails.patrimony}`}
          icon={DesktopTower}
        />

        <CardDetails 
          title="descrição do problema"
          description={orderDetails.description}
          icon={ClipboardText}
          footer={`Registado em ${orderDetails.when}`}
        />

        <CardDetails 
          title="solução do problema"
          icon={CircleWavyCheck}
          description={orderDetails.solution}
          footer={orderDetails.closed && `Encerrado em ${orderDetails.closed}`}
        >
          {
            orderDetails.status === 'open' &&
            <Input 
              h={24}
              placeholder="Descrição da solução"
              onChangeText={setSolution}
              textAlignVertical="top"
              multiline
            />
          }
        </CardDetails>

      </ScrollView>
      
      {
        orderDetails.status === 'open' && 
          <Button title="Finalizar" m={5} onPress={handleOrderClose} />
      }

    </VStack>
  );
}