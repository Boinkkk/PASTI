import { Link } from 'react-router-dom'
import Button from '@mui/joy/Button';

function NotFoundPage() {
  return (
    <>
    <h1>Page Not Found!</h1>
    <Link to={"/"}>
        <Button>Hello</Button>
    </Link>
    </>
    
  )
}

export default NotFoundPage