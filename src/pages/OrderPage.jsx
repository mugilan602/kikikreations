import React from 'react'
import OrderTable from '../components/OrderTable'
import { Plus } from 'lucide-react';

function OrderPage() {
    return (
        <div className='bg-gray-50' >
            <div className='flex items-center justify-between mx-8 py-4'>
                <h1 className='font-semibold text-2xl' >My Orders</h1>
                <button className='border flex px-2 py-2 text-white items-center bg-[#2262C6] rounded-lg'><span className='mr-2'>  <Plus /></span> New Order</button>
            </div>
            <OrderTable />
        </div>
    )
}

export default OrderPage
