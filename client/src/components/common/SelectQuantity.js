import React, { memo } from 'react'
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai'

const SelectQuantity = ({ quantity, handleQuantity, handleChangeQuantity, inStock }) => {
    return (
        <div className='flex items-center'>
            <span 
                onClick={() => handleChangeQuantity('minus')}
                className={`p-2 cursor-pointer border-r ${quantity === 1 ? 'bg-gray-700 text-gray-500' : 'hover:bg-gray-700'} transition-all`}
            >
                <AiOutlineMinus />
            </span>
            <input
                className='py-2 outline-none w-[50px] text-center bg-transparent'
                type='number'
                value={quantity}
                onChange={e => {
                    const value = parseInt(e.target.value)
                    if (value > 0 && value <= inStock) handleQuantity(value)
                }}
                onBlur={e => {
                    if (!e.target.value || +e.target.value < 1) handleQuantity(1)
                    if (+e.target.value > inStock) handleQuantity(inStock)
                }}
            />
            <span 
                onClick={() => {
                    if (quantity < inStock) handleChangeQuantity('plus')
                }}
                className={`p-2 cursor-pointer border-l ${quantity >= inStock ? 'bg-gray-700 text-gray-500' : 'hover:bg-gray-700'} transition-all`}
            >
                <AiOutlinePlus />
            </span>
            
        </div>
    )
}

export default memo(SelectQuantity)