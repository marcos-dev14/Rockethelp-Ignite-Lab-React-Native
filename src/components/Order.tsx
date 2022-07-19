import { Box, Circle, HStack, Text, useTheme, VStack, Pressable, IPressableProps } from 'native-base';
import { CircleWavyCheck, ClockAfternoon, Hourglass } from 'phosphor-react-native';

export interface OrderDataProps {
  id: string;
  patrimony: string;
  when: string;
  status: 'open' | 'closed'
}

interface Props extends IPressableProps {
  data: OrderDataProps;
}

export function Order({data, ...rest}: Props) {
  const { colors } = useTheme();

  const colorStatus = data.status === 'open' ? colors.secondary[700] : colors.green[300];

  return (
    <Pressable {...rest}>
      <HStack
        bg="gray.600"
        mb={4}
        alignItems="center"
        justifyContent="space-between"
        rounded="sm"
        overflow="hidden"
      >
        <Box h="full" w={2} bg={colorStatus} />

        <VStack flex={1} my={5} ml={5}>
          <Text color="white" fontSize="md">
            Patrimônio {data.patrimony}
          </Text>

          <HStack alignItems="center" mt={1}>
            <ClockAfternoon size={15} color={colors.gray[300]} />
            <Text color="gray.200" fontSize="xs" ml={1}>
              {data.when}
            </Text>
          </HStack>
        </VStack>

        <Circle bg="gray.500" h={12} w={12} mr={5}>
          {
            data.status === 'closed'
              ? <CircleWavyCheck size={24} color={colorStatus} />
              : <Hourglass size={24} color={colorStatus} />
          }
        </Circle>
      </HStack>
    </Pressable>
  );
}