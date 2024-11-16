import React, { memo, useRef, useEffect, useState } from 'react'
import logo from 'assets/logo.png'
import { voteOptions } from 'ultils/contants'
import { AiFillStar } from 'react-icons/ai'
import { Button } from 'components'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { getBase64 } from 'ultils/helpers'

const VoteOption = ({ nameProduct, handleSubmitVoteOption }) => {
    const modalRef = useRef()
    const [chosenScore, setChosenScore] = useState(null)
    const [comment, setComment] = useState('')
    const [score, setScore] = useState(null)
    const [preview, setPreview] = useState({
        images: []
    })
    const [images, setImages] = useState([])
    const { register, formState: { errors }, reset, handleSubmit, watch } = useForm()

    const handlePreviewImages = async (files) => {
        const imagesPreview = []
        for (let file of files) {
            if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
                toast.warning('File not supported!')
                return
            }
            const base64 = await getBase64(file)
            imagesPreview.push({ name: file.name, path: base64 })
        }
        setPreview(prev => ({ ...prev, images: imagesPreview }))
    }

    const handleFileChange = (e) => {
        const files = e.target.files
        setImages(files)
        handlePreviewImages(files)
    }

    useEffect(() => {
        handlePreviewImages(watch('images'))
    }, [watch('images')])

    useEffect(() => {
        register('images', { onChange: handleFileChange })
    }, [])

    useEffect(() => {
        modalRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, [])
    return (
        <div onClick={e => e.stopPropagation()} ref={modalRef} className='bg-white w-[700px] p-4 flex-col gap-4 flex items-center justify-center'>
            <img src={logo} alt="logo" className='w-[300px] my-8 object-contain' />
            <h2 className='text-center text-medium text-lg'>{`Voting product ${nameProduct}`}</h2>
            <textarea
                className='form-textarea w-full placeholder:italic placeholder:text-xs placeholder:text-gray-500 text-sm'
                placeholder='Type something'
                value={comment}
                onChange={e => setComment(e.target.value)}
            ></textarea>
            <div className='flex flex-col gap-2 mt-8'>
                <label className='font-semibold' htmlFor="products">Upload images of product (1 image)</label>
                <input
                    type="file"
                    id="products"
                    {...register('images', { required: 'Need fill' })}
                />
            </div>
            <div className='w-full flex flex-col gap-4'>
                <p>How do you like this product?</p>
                <div className='flex justify-center gap-4 items-center'>
                    {voteOptions.map(el => (
                        <div
                            className='w-[100px] bg-gray-200 cursor-pointer rounded-md p-4 h-[100px] flex items-center justify-center flex-col gap-2' key={el.id}
                            onClick={() => {
                                setChosenScore(el.id)
                                setScore(el.id)
                            }}
                        >
                            {(Number(chosenScore) && chosenScore >= el.id) ? <AiFillStar color='orange' /> : <AiFillStar color='gray' />}
                            <span>{el.text}</span>
                        </div>
                    ))}
                </div>
            </div>
            {preview.images.length > 0 && <div className='my-4 flex w-full gap-3 flex-wrap'>
                {preview.images?.map((el, idx) => (
                    <div
                        key={idx}
                        className='w-fit relative'
                    >
                        <img src={el.path} alt="product" className='w-[200px] object-contain' />
                    </div>
                ))}
            </div>}
            <Button
                handleOnClick={() => handleSubmitVoteOption({ comment, score, images })}
                fw
            >
                Submit
            </Button>
        </div>
    )
}

export default memo(VoteOption)