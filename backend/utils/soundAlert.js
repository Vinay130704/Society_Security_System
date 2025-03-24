const triggerSoundAlert = () => {
    console.log('⚠️ Playing emergency sound alert for 20 seconds ⚠️');
    setTimeout(() => {
        console.log('🔇 Sound alert stopped');
    }, 20000);
};