import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import { HomeScreen } from '../screens/task/HomeScreen';
import { CreateEditTaskScreen } from '../screens/task/CreateEditTaskScreen';
import { TaskDetailScreen } from '../screens/task/TaskDetailScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="CreateEditTask"
        component={CreateEditTaskScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
};
