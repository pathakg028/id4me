import { useAppSelector, useAppDispatch } from './app/hooks';
import { increment, decrement, incrementByAmount } from './features/counter/counterSlice';
import type { RootState } from './app/store';
import MobileVerification from './pages/MobileVerification';
import ProfileForm from './components/ProfileForm';

function App() {
  return (
    <div className='container mx-auto p-4 bg-gray-100 rounded shadow-md'>
      <MobileVerification className='mb-10' />
    </div>
  );
}

export default App;