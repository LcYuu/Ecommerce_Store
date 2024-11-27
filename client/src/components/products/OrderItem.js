import SelectQuantity from 'components/common/SelectQuantity'
import React, { useState } from 'react'
import { formatMoney } from 'ultils/helpers'
import { updateCart } from 'store/user/userSlice'
import withBaseComponent from 'hocs/withBaseComponent'
import { apiUpdateCart } from 'apis'
import { getCurrent } from 'store/user/asyncActions'
import toast from 'react-hot-toast'

const OrderItem = ({ dispatch, color, dfQuantity = 1, price, title, thumbnail, pid, inStock }) => {
    const [quantity, setQuantity] = useState(() => dfQuantity)
    
    const handleQuantity = async (number) => {
        if (!Number(number) || Number(number) < 1) return
        
        const response = await apiUpdateCart({
            pid,
            quantity: number,
            color,
            price,
            thumbnail,
            title,
            isUpdatingQuantity: true
        })
        
        if (response.success) {
            setQuantity(number)
            dispatch(getCurrent())
        } else {
            toast.error(response.mes)
        }
    }

    const handleChangeQuantity = async (flag) => {
        if (flag === 'minus' && quantity === 1) return
        
        const newQuantity = flag === 'minus' ? quantity - 1 : quantity + 1
        
        const response = await apiUpdateCart({
            pid,
            quantity: newQuantity,
            color,
            price,
            thumbnail,
            title,
            isUpdatingQuantity: true
        })
        
        if (response.success) {
            setQuantity(newQuantity)
            dispatch(getCurrent())
        } else {
            toast.error(response.mes)
        }
    }

    return (
        <div className='w-main mx-auto border-b font-bold py-3 grid grid-cols-10'>
            <span className='col-span-6 w-full text-center'>
                <div className='flex gap-2 px-4 py-3'>
                    <img src={thumbnail} alt="thumb" className='w-28 h-28 object-cover' />
                    <div className='flex flex-col items-start gap-1'>
                        <span className='text-sm text-main'>{title}</span>
                        <span className='text-[10px] font-main'>{color}</span>
                    </div>
                </div>
            </span>
            <span className='col-span-1 w-full text-center'>
                <div className='flex items-center h-full'>
                    <SelectQuantity
                        quantity={quantity}
                        handleQuantity={handleQuantity}
                        handleChangeQuantity={handleChangeQuantity}
                        inStock={inStock}
                    />
                </div>
            </span>
            <span className='col-span-3 w-full h-full flex items-center justify-center text-center'>
                <span className='text-lg'>{formatMoney(price * quantity) + ' VND'}</span>
            </span>
        </div>
    )
}

export default withBaseComponent(OrderItem)