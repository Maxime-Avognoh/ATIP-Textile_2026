
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import Button from '../components/Button';
import BackToCollectionLink from '../components/BackToCollectionLink';
import { Order } from '../types';

const ProfilePage: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const { t, locale } = useLocale();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        try {
            const userOrders = localStorage.getItem(`orders_${currentUser.uid}`);
            if (userOrders) {
                setOrders(JSON.parse(userOrders));
            }
        } catch (error) {
            console.error("Failed to load orders", error);
        }
    }, [currentUser, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-4xl mx-auto pt-32 pb-12 px-4 animate-fade-in">
            <BackToCollectionLink />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                <div>
                    <h1 className="text-4xl font-aboreto text-title">{t('auth.profile.title')}</h1>
                    <p className="text-lg text-subtitle/80 mt-2">{t('auth.profile.welcome', { name: currentUser.displayName || currentUser.email || 'User' })}</p>
                </div>
                <Button variant="black" onClick={handleLogout} className="mt-4 md:mt-0 text-sm">
                    {t('auth.profile.logout')}
                </Button>
            </div>
            <div>
                <h2 className="text-2xl font-aboreto text-title mb-6 border-b border-subtitle/10 pb-2">{t('auth.profile.orderHistory')}</h2>
                {orders.length === 0 ? (
                    <div className="bg-black-button/10 rounded-lg p-8 text-center">
                        <p className="text-subtitle/80 mb-4">{t('auth.profile.noOrders')}</p>
                        <Button variant="red" onClick={() => navigate('/')}>
                            {t('home.title')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <div key={index} className="bg-black-button/20 rounded-lg p-6 shadow-md">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-subtitle/10 gap-4">
                                    <div>
                                        <p className="font-bold text-title">{t('auth.profile.order.number')}: {order.orderNumber}</p>
                                        <p className="text-sm text-subtitle/70">{new Date().toLocaleDateString(locale)}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="font-bold text-title">€ {order.total.toFixed(2)}</p>
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                            {order.status || 'Processing'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 mb-2 last:mb-0">
                                            <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                                <img src={item.images[0]} alt={item.name[locale]} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-medium text-title">{item.name[locale]}</p>
                                                <p className="text-subtitle/70">{item.format} x {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
