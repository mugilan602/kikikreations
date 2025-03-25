import React, { useState } from 'react';
import OrderTable from '../components/OrderTable';
import { Plus } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent,DialogTitle } from "../components/ui/dialog";
import AddNewOrder from '../components/AddNewOrder';

function OrderPage() {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-gray-50">
            <div className="flex items-center justify-between mx-8 py-4">
                <h1 className="font-semibold text-2xl">My Orders</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button
                            className="border flex px-2 py-2 text-white items-center bg-[#2262C6] rounded-lg"
                        >
                            <span className="mr-2"><Plus /></span> New Order
                        </button>
                    </DialogTrigger>

                    {/* Dialog with scrollable content */}
                    <DialogContent className="" aria-describedby={undefined}>
                        <DialogTitle className="text-lg font-semibold"></DialogTitle>
                        <AddNewOrder setOpen={setOpen} />
                    </DialogContent>
                </Dialog>
            </div>
            <OrderTable />
        </div>
    );
}

export default OrderPage;
