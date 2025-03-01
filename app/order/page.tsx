//app/order/page.tsx
import BuffetManagement from "../components/BuffetManagement"
import OrderForm from "../components/OrderFrom"
import Navbar from '@/app/components/Navbar';
const Order = () => {
  return (
    <div className="container mx-auto py-8">
    <Navbar/>
    <OrderForm />
    <BuffetManagement/>
  </div>
  )
}
export default Order