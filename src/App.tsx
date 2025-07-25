import { useAppSelector, useAppDispatch } from './app/hooks';
import { increment, decrement, incrementByAmount } from './features/counter/counterSlice';
import type { RootState } from './app/store';
import ProgressBar from './components/ProgressBar';
import MobileVerification from './pages/MobileVerification';
import ProfileForm from './components/ProfileForm';

function App() {
  const count = useAppSelector((state: RootState) => state.counter.value);
  console.log(count);
  const dispatch = useAppDispatch();

  return (
    <div className='container mx-auto p-4 bg-gray-100 rounded shadow-md'>
      <h1>Count: {count}</h1>
      <button onClick={() => dispatch(increment())}>Increment</button>
      <button onClick={() => dispatch(decrement())}>Decrement</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>Increment by 5</button>

      <ProgressBar className='mb-10' />
      <MobileVerification className='mb-10' />

      <ProfileForm className='mb-10' />

    </div>
  );
}

export default App;