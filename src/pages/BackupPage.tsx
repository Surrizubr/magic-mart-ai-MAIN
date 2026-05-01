import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, History, FileJson, AlertTriangle, CheckCircle2, ChevronLeft, RefreshCw, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { resetAllData } from '@/data/mockData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BackupPageProps {
  onBack: () => void;
}

export function BackupPage({ onBack }: BackupPageProps) {
  const { t } = useLanguage();
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<{ open: boolean; data: any }>({ open: false, data: null });

  const handleReset = () => {
    resetAllData();
    setConfirmReset(false);
    window.location.reload();
  };

  useEffect(() => {
    const checkLastBackup = async () => {
      const last = await storage.get('last_backup_info');
      if (last && last.date) {
        setLastBackupDate(last.date);
      }
    };
    checkLastBackup();
  }, []);

  const handleBackup = async () => {
    try {
      const allData = await storage.getAll();
      
      // Include app settings from localStorage
      const appSettings = {
        'app-lang': localStorage.getItem('app-lang'),
        'app-theme': localStorage.getItem('app-theme'),
        'app-fontSize': localStorage.getItem('app-fontSize'),
        'gemini-api-key': localStorage.getItem('gemini-api-key'),
      };

      // Add version/metadata
      const backupData = {
        version: 2,
        timestamp: new Date().toISOString(),
        settings: appSettings,
        data: allData
      };

      // Save as "last backup" in storage for the quick restore function
      await storage.set('last_backup_data', backupData);
      const now = new Date().toLocaleString();
      await storage.set('last_backup_info', { date: now });
      setLastBackupDate(now);

      // Generate filename: magic-mart-backup-YYYY-MM-DD-vN.json
      const dateStr = new Date().toISOString().split('T')[0];
      
      // Simple logic for versioning based on today's count
      const backupsToday = await storage.get(`backups_count_${dateStr}`) || 0;
      const nextVersion = backupsToday + 1;
      await storage.set(`backups_count_${dateStr}`, nextVersion);

      const filename = `magic-mart-backup-${dateStr}-v${nextVersion}.json`;
      
      // Download file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('backupSuccess'));
    } catch (error) {
      console.error('Backup error:', error);
      toast.error(t('backupError'));
    }
  };

  const restoreData = async (backupJson: any) => {
    setIsRestoring(true);
    try {
      if (!backupJson || !backupJson.data) throw new Error('Invalid format');

      const data = backupJson.data;
      const settings = backupJson.settings || {};
      
      // Clear current data first
      await storage.clear();
      // Keep essential login info if any, but clear preferences
      const essentialKeys = ['sb-eprk4ijhieql3asgbf5geh-auth-token']; // Example of keys to potentially keep if using Supabase/Auth
      for (const key of Object.keys(localStorage)) {
        if (!essentialKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      }

      // Restore each data key
      for (const [key, value] of Object.entries(data)) {
        await storage.set(key, value);
      }

      // Restore settings
      if (settings['app-lang']) localStorage.setItem('app-lang', settings['app-lang']);
      if (settings['app-theme']) localStorage.setItem('app-theme', settings['app-theme']);
      if (settings['app-fontSize']) localStorage.setItem('app-fontSize', settings['app-fontSize']);
      if (settings['gemini-api-key']) localStorage.setItem('gemini-api-key', settings['gemini-api-key']);

      // Backward compatibility for v1 backups
      if (data['gemini-api-key'] && typeof data['gemini-api-key'] === 'string') {
        localStorage.setItem('gemini-api-key', data['gemini-api-key']);
      }

      toast.success(t('restoreSuccess'));
      
      // Need to reload to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Restore error:', error);
      toast.error(t('restoreError'));
      setIsRestoring(false);
    }
  };

  const handleRestoreLast = async () => {
    const last = await storage.get('last_backup_data');
    if (!last) {
      toast.error(t('noLastBackup'));
      return;
    }
    
    setConfirmRestore({ open: true, data: last });
  };

  const handleRestoreFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setConfirmRestore({ open: true, data: json });
        } catch (err) {
          toast.error(t('restoreError'));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="pb-20">
      <PageHeader 
        title={t('backup')} 
        subtitle={t('backupDesc')} 
        onBack={onBack}
      />

      <div className="p-4 space-y-6">
        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center space-y-3"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <History className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{t('backupStatus')}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {lastBackupDate 
                ? `${t('lastBackupFound')} ${lastBackupDate}`
                : t('noLastBackup')
              }
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleBackup} 
            className="w-full h-14 gradient-primary text-primary-foreground border-0 shadow-lg flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5" />
              <div className="text-left">
                <p className="font-bold">{t('makeBackup')}</p>
                <p className="text-[10px] opacity-80">{t('saveOnDevice')}</p>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            onClick={handleRestoreLast}
            disabled={!lastBackupDate || isRestoring}
            className="w-full h-14 bg-card border-border shadow-sm flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-bold text-foreground">{t('restoreLastBackup')}</p>
                <p className="text-[10px] text-muted-foreground">{t('recoverLocalBackup')}</p>
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            onClick={handleRestoreFromFile}
            disabled={isRestoring}
            className="w-full h-14 bg-card border-border shadow-sm flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="font-bold text-foreground">{t('restoreFromFile')}</p>
                <p className="text-[10px] text-muted-foreground">{t('selectJsonFile')}</p>
              </div>
            </div>
          </Button>
        </div>

        {/* Security Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-900">{t('attention')}</p>
            <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
              {t('backupWarning')}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            onClick={() => setConfirmReset(true)}
            className="w-full h-14 bg-destructive/5 border-destructive/20 hover:bg-destructive/10 shadow-sm flex items-center justify-between px-6 group transition-all"
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-destructive group-hover:rotate-[-45deg] transition-transform" />
              <div className="text-left">
                <p className="font-bold text-destructive">{t('resetAll')}</p>
                <p className="text-[10px] text-muted-foreground">{t('resetDesc')}</p>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {isRestoring && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
          <p className="text-sm font-bold text-primary">{t('restoringData')}</p>
          <p className="text-xs text-muted-foreground">{t('appWillRestart')}</p>
        </div>
      )}

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent className="w-[90vw] rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('resetAll')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmReset')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3">
            <AlertDialogCancel className="mt-0 flex-1 rounded-xl">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl border-0">
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmRestore.open} onOpenChange={(open) => setConfirmRestore({ ...confirmRestore, open })}>
        <AlertDialogContent className="w-[90vw] rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('restoreFromFile')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmRestore')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3">
            <AlertDialogCancel className="mt-0 flex-1 rounded-xl">{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (confirmRestore.data) {
                  restoreData(confirmRestore.data);
                }
                setConfirmRestore({ open: false, data: null });
              }} 
              className="flex-1 gradient-primary text-primary-foreground rounded-xl border-0 shadow-lg"
            >
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
