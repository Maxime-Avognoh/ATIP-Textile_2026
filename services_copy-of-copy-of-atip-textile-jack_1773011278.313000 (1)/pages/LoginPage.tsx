
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import Button from '../components/Button';
import BackToCollectionLink from '../components/BackToCollectionLink';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const { t } = useLocale();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login(email, password);
            navigate('/profile');
        } catch (err) {
            setError(t('auth.login.error'));
            console.error(err);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-md mx-auto pt-32 pb-12 px-4 animate-fade-in">
            <div>
                <BackToCollectionLink />
            </div>
            <div className="bg-black-button/20 p-8 rounded-lg shadow-xl mt-4">
                <h2 className="text-3xl font-aboreto text-title text-center mb-2">{t('auth.login.title')}</h2>
                <p className="text-subtitle/80 text-center mb-8">{t('auth.login.subtitle')}</p>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-subtitle/90 mb-1">{t('auth.login.email')}</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white dark:bg-black-button text-subtitle border border-subtitle/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-button focus:border-red-button"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-subtitle/90 mb-1">{t('auth.login.password')}</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white dark:bg-black-button text-subtitle border border-subtitle/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-button focus:border-red-button"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button variant="red" type="submit" className="w-full" disabled={isSubmitting}>
                        {t('auth.login.submit')}
                    </Button>
                </form>
                
                <div className="mt-6 text-center text-subtitle/80">
                    {t('auth.login.noAccount')} <Link to="/register" className="text-red-button hover:underline">{t('auth.login.register')}</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
