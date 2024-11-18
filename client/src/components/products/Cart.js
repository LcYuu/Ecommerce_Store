import Button from 'components/buttons/Button'
import withBaseComponent from 'hocs/withBaseComponent'
import React, { memo, useState } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { useSelector } from 'react-redux'
import { showCart } from 'store/app/appSlice'
import { formatMoney } from 'ultils/helpers'
import { ImBin } from 'react-icons/im'
import { apiRemoveCart, apiUpdateCart } from 'apis'
import { getCurrent } from 'store/user/asyncActions'
import { Toast } from 'configs/toast' 
import path from 'ultils/path'
import SelectQuantity from 'components/common/SelectQuantity'

const Cart = ({ dispatch, navigate }) => {
    const { currentCart } = useSelector(state => state.user)
    
    const removeCart = async (pid, color) => {
        const response = await apiRemoveCart(pid, color)
        if (response.success) {
            dispatch(getCurrent())
        } else {
            Toast.error(response.mes)
        }
    }

    const updateQuantity = async (pid, quantity, color, price, thumbnail, title) => {
        if (quantity < 1) return
        
        const response = await apiUpdateCart({
            pid,
            quantity,
            color,
            price,
            thumbnail, 
            title,
            isUpdatingQuantity: true
        })
        
        if (response.success) {
            dispatch(getCurrent())
        } else {
            Toast.error(response.mes)
        }
    }

    return (
        <div onClick={e => e.stopPropagation()} className='w-[400px] h-screen bg-black grid grid-rows-10 text-white p-6'>
            <header className='border-b border-gray-500 flex justify-between items-center row-span-1 h-full font-bold text-2xl'>
                <span>Your Cart</span>
                <span onClick={() => dispatch(showCart())} className='p-2 cursor-pointer'><AiFillCloseCircle size={24} /></span>
            </header>
            <section className='row-span-7 flex flex-col gap-3 h-full max-h-full overflow-y-auto py-3'>
                {!currentCart && <span className='text-xs italic'>Your cart is empty.</span>}
                {currentCart && currentCart.map(el => (
                    <div key={el._id} className='flex justify-between items-center bg-gray-800 p-4 rounded-lg'>
                        <div className='flex gap-4'>
                            <img src={el.thumbnail} alt="thumb" className='w-16 h-16 object-cover rounded-md' />
                            <div className='flex flex-col gap-2'>
                                <span className='text-sm text-main font-medium'>{el.title}</span>
                                <span className='text-xs text-gray-400'>{el.color}</span>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex items-center gap-2 bg-gray-900 rounded-md border border-gray-700'>
                                        <SelectQuantity 
                                            quantity={el.quantity}
                                            inStock={el.product?.quantity || 0}
                                            handleQuantity={(number) => {
                                                if (number <= el.product?.quantity) {
                                                    updateQuantity(
                                                        el.product?._id,
                                                        number,
                                                        el.color,
                                                        el.price,
                                                        el.thumbnail,
                                                        el.title
                                                    )
                                                }
                                            }}
                                            handleChangeQuantity={(flag) => {
                                                let newQuantity = el.quantity
                                                if (flag === 'minus' && el.quantity > 1) {
                                                    newQuantity = el.quantity - 1
                                                }
                                                if (flag === 'plus' && el.quantity < el.product?.quantity) {
                                                    newQuantity = el.quantity + 1
                                                }
                                                
                                                if (newQuantity !== el.quantity) {
                                                    updateQuantity(
                                                        el.product?._id,
                                                        newQuantity,
                                                        el.color,
                                                        el.price,
                                                        el.thumbnail,
                                                        el.title
                                                    )
                                                }
                                            }}
                                        />
                                    </div>
                                    <span className='text-xs text-gray-400'>
                                        In stock: {el.product?.quantity || 0}
                                    </span>
                                </div>
                                <span className='text-sm font-medium text-main'>
                                    {formatMoney(el.price * el.quantity) + ' VND'}
                                </span>
                            </div>
                        </div>
                        <span 
                            onClick={() => removeCart(el.product?._id, el.color)} 
                            className='h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-all'
                        >
                            <ImBin size={16} />
                        </span>
                    </div>
                ))}
            </section>
            <div className='row-span-2 flex flex-col justify-between h-full'>
                <div className='flex items-center justify-between pt-4 border-t'>
                    <span>Subtotal:</span>
                    <span>{formatMoney(currentCart?.reduce((sum, el) => sum + Number(el.price) * el.quantity, 0)) + ' VND'}</span>
                </div>
                <span className='text-center text-gray-700 italic text-xs'>Shipping, taxes, and discounts calculated at checkout.</span>
                <Button handleOnClick={() => {
                    dispatch(showCart())
                    navigate(`/${path.MEMBER}/${path.DETAIL_CART}`)
                }} style='rounded-none w-full bg-main py-3'>Shopping Cart</Button>
            </div>
        </div>
    )
}

export default withBaseComponent(memo(Cart))