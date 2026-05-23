import { useEffect, useMemo, useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';
import { useToast } from '../context/ToastContext';

const isStandalone = () => (
    window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
);

const isMobileDevice = () => (
    window.matchMedia('(max-width: 768px)').matches
    || /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)
);

const isIosDevice = () => /iPhone|iPad|iPod/i.test(window.navigator.userAgent);

const PWAStatus = () => {
    const toast = useToast();
    const [installPrompt, setInstallPrompt] = useState(null);
    const [visible, setVisible] = useState(false);
    const [installed, setInstalled] = useState(false);

    const ios = useMemo(() => isIosDevice(), []);

    useEffect(() => {
        const updateServiceWorker = registerSW({
            immediate: true,
            onNeedRefresh() {
                const shouldRefresh = window.confirm('Une nouvelle version est disponible. Recharger maintenant ?');

                if (shouldRefresh) {
                    updateServiceWorker(true);
                } else {
                    toast.info('Nouvelle version prête pour le prochain lancement.', 5000);
                }
            },
            onOfflineReady() {
                toast.success('ExellenceLink est prêt pour le mode hors ligne.', 5000);
            },
            onRegisterError(error) {
                console.error('Service worker registration failed', error);
            },
        });
    }, [toast]);

    useEffect(() => {
        const onOnline = () => toast.success('Connexion rétablie.', 3000);
        const onOffline = () => toast.info('Mode hors ligne activé.', 4000);

        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, [toast]);

    useEffect(() => {
        const shouldShowInstallCard = () => {
            if (!isMobileDevice() || isStandalone()) {
                return false;
            }

            return true;
        };

        setVisible(shouldShowInstallCard());

        const onBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setInstallPrompt(event);
            setVisible(shouldShowInstallCard());
        };

        const onAppInstalled = () => {
            setInstalled(true);
            setVisible(false);
            setInstallPrompt(null);
            toast.success('Application installée avec succès.', 4000);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.addEventListener('appinstalled', onAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
            window.removeEventListener('appinstalled', onAppInstalled);
        };
    }, [toast]);

    const install = async () => {
        if (!installPrompt) {
            toast.info('Utilisez le menu du navigateur pour installer l’application.', 5000);
            return;
        }

        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        setInstallPrompt(null);

        if (choice.outcome === 'accepted') {
            setVisible(false);
        } else {
            toast.info('Installation annulée. La proposition reviendra au prochain lancement mobile.', 5000);
        }
    };

    if (!visible || installed) {
        return null;
    }

    return (
        <section className="pwa-install-card" aria-label="Installer ExellenceLink">
            <div className="pwa-install-icon">
                <Smartphone size={20} />
            </div>
            <div className="pwa-install-copy">
                <strong>Installer l’application</strong>
                {ios ? (
                    <span>
                        Touchez <Share size={13} /> puis “Sur l’écran d’accueil”.
                    </span>
                ) : (
                    <span>Ajoutez ExellenceLink à votre mobile pour l’utiliser comme une APK.</span>
                )}
            </div>
            {!ios && (
                <button type="button" className="pwa-install-action" onClick={install}>
                    <Download size={15} />
                    Installer
                </button>
            )}
            <button type="button" className="pwa-install-close" onClick={() => setVisible(false)} aria-label="Fermer">
                <X size={16} />
            </button>
        </section>
    );
};

export default PWAStatus;
