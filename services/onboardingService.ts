
export const getOnboardingFlags = () => {
    const raw = localStorage.getItem('tabetotto_onboarding');
    if (!raw) return {
        hasSeenOnboarding: false,
        hasCompletedInitialSetup: false,
        hasCompletedFirstMealRecord: false
    };
    return JSON.parse(raw);
};

export const setOnboardingFlags = (flags: any) => {
    localStorage.setItem('tabetotto_onboarding', JSON.stringify({ ...getOnboardingFlags(), ...flags }));
};
