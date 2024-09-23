import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import axios from 'axios'

// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
}

// 👇 Here you will create your schema.
const schema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, validationErrors.fullNameTooShort)
    .max(20, validationErrors.fullNameTooLong)
    .required('Full name is required'),
  size: Yup.string()
    .oneOf(['S', 'M', 'L'], validationErrors.sizeIncorrect)
    .required('Size is required'),
  toppings: Yup.array().of(Yup.string()).required('At least one topping is required'),
})

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
]

export default function Form() {
  const [fullName, setFullName] = useState('')
  const [size, setSize] = useState('')
  const [selectedToppings, setSelectedToppings] = useState([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    validateForm();
  }, [fullName, size, selectedToppings])

  const validateForm = () => {
    try {
      schema.validateSync({
        fullName,
        size,
        toppings: selectedToppings,
      })
      setError('')
      return true
    } catch (err) {
      setError(err.errors[0])
      return false
    }
  }

  const handleInputChange = (e) => {
    setFullName(e.target.value)
  }
  
  const handleSizeChange = (e) => {
    setSize(e.target.value)
  }

  const handleToppingChange = (e) => {
    const { value, checked } = e.target
    if (checked) {
      setSelectedToppings([...selectedToppings, value])
    } else {
      setSelectedToppings(selectedToppings.filter(topping => topping !== value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('')
    setSuccessMessage('')
    setSubmitted(true)

    if (!validateForm()) return
    try {
      await schema.validate({
        fullName,
        size,
        toppings: selectedToppings,
      })
  
      const orderData = {
        fullName,
        size,
        toppings: selectedToppings,
      }
      console.log('Order Data:', orderData)
      console.log('Form State:', { fullName, size, selectedToppings });
  
      const response = await axios.post('http://localhost:9009/api/order', orderData);
      
      if (response.status === 200) {
        setSuccessMessage(`Thank you for your order, ${fullName}! Your ${size} pizza with ${selectedToppings.length} topping(s) is on the way.`)
        setFullName('')
        setSize('')
        setSelectedToppings([])
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        setError(err.errors[0])
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} >
      <h2>Order Your Pizza</h2>
      {submitted && successMessage && <div className='success'>{successMessage}</div>}
      {submitted && error && <div className='error'>{error}</div>}

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label><br />
          <input placeholder="Type full name" id="fullName" type="text" value={fullName} onChange={handleInputChange} />
        </div>
          {submitted && !fullName && <div className='error'>Full name is required</div>}
          {submitted && fullName.length < 3 && <div className='error'>{validationErrors.fullNameTooShort}</div>}
          {submitted && fullName.length > 20 && <div className='error'>{validationErrors.fullNameTooLong}</div>}
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label><br />
          <select id="size" value={size} onChange={handleSizeChange}>
            <option value="">----Choose Size----</option>
            {/* Fill out the missing options */}
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
        </div>
          {submitted && !size && <div className='error'>Size is required</div>}
          {submitted && size && !['S', 'M', 'L'].includes(size) && <div className='error'>{validationErrors.sizeIncorrect}</div>}
      </div>

      <div className="input-group">
        {/* 👇 Maybe you could generate the checkboxes dynamically */}
        {toppings.map(topping => (
        <label key={topping.topping_id}>
          <input
            name="toppings"
            type="checkbox"
            value={topping.text}
            checked={selectedToppings.includes(topping.text)}
            onChange={handleToppingChange}
          />
          {topping.text}<br />
        </label>
        ))}
          {submitted && selectedToppings.length === 0 && <div className='error'>At least one topping is required</div>}
      </div>
      {/* 👇 Make sure the submit stays disabled until the form validates! */}
      <button type="submit" disabled={!fullName || !size || selectedToppings.length === 0}>
      Submit Order
      </button>
    </form>
  )
}
