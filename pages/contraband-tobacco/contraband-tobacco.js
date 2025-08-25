// Corrected Contraband Tobacco Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const stickyCard = document.querySelector('.contraband-reward-card-sticky');
    const stopSection = document.querySelector('.contraband-cards-section');
    const parentContainer = document.querySelector('.contraband-what-section');

    if (!stickyCard || !stopSection || !parentContainer) {
        console.log('Missing elements:', {
            stickyCard: !!stickyCard,
            stopSection: !!stopSection, 
            parentContainer: !!parentContainer
        });
        return;
    }

    function handleStickyCard() {
        const cardRect = stickyCard.getBoundingClientRect();
        const stopRect = stopSection.getBoundingClientRect();
        const parentRect = parentContainer.getBoundingClientRect();

        // Debug logging
        console.log('Scroll position:', window.scrollY);
        console.log('Card top:', cardRect.top);
        console.log('Stop section top:', stopRect.top);
        console.log('Parent bottom:', parentRect.bottom);

        // Calculate when the card should stop being sticky
        // The card should stop being sticky when the stop section is about to overlap
        const cardHeight = cardRect.height;
        const shouldStop = stopRect.top <= (cardHeight + 40); // 40px buffer

        if (shouldStop) {
            // Instead of inline styles, just add a class
            stickyCard.classList.add('stop-sticky');
            console.log('Card stopped being sticky');
        } else {
            // Remove the stop class to restore sticky behavior
            stickyCard.classList.remove('stop-sticky');
            console.log('Card is sticky');
        }
    }

    // Listen for scroll events
    window.addEventListener('scroll', handleStickyCard);
    window.addEventListener('resize', handleStickyCard);

    // Initial check
    handleStickyCard();
});