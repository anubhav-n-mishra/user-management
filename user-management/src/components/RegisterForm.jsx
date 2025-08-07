import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.css';

function SignUp(){
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [cPassword, setCpassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== cPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await signup({ name, email, password, confirmPassword: cPassword });
            navigate('/signin', { 
                state: { message: 'Account created successfully! Please sign in.' }
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Sign Up</h2>
                {error && <div className="error">{error}</div>}
                
                <label>Name</label>
                <input 
                     type="text" 
                     value={name} 
                     onChange={(e) => setName(e.target.value)} 
                     required 
                     disabled={loading}
                />
                
                <label>Email</label>
                <input 
                     type="email" 
                     value={email} 
                     onChange={(e) => setEmail(e.target.value)} 
                     required 
                     disabled={loading}
                />
                
                <label>Password</label>
                <input 
                     type="password" 
                     value={password} 
                     onChange={(e) => setPassword(e.target.value)} 
                     required 
                     disabled={loading}
                     minLength="6"
                />
                
                <label>Confirm Password</label>
                <input 
                     type="password" 
                     value={cPassword} 
                     onChange={(e) => setCpassword(e.target.value)} 
                     required 
                     disabled={loading}
                     minLength="6"
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
                
                <div className="auth-link">
                    Already have an account? <Link to="/signin">Sign In</Link>
                </div>
            </form>
        </div>
    );
}

export default SignUp;
