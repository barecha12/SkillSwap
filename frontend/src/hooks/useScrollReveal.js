import { useEffect } from 'react'

/**
 * useScrollReveal
 * An enhanced custom hook that uses the Intersection Observer API to reveal elements.
 * It also uses a MutationObserver to automatically detect and observe dynamically 
 * added content (like after an API fetch).
 */
export default function useScrollReveal() {
    useEffect(() => {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        }

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active')
                    // Once it's revealed, we don't need to observe it anymore
                    revealObserver.unobserve(entry.target)
                }
            })
        }, observerOptions)

        // Function to find and observe un-revealed elements
        const observeElements = () => {
            const elements = document.querySelectorAll('.reveal:not(.active), .animate-in:not(.active)')
            elements.forEach(el => revealObserver.observe(el))
        }

        // Initial scan for static content
        observeElements()

        // MutationObserver to handle dynamically added content (e.g., after loading finishes)
        const mutationObserver = new MutationObserver(() => {
            observeElements()
        })

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        })

        return () => {
            revealObserver.disconnect()
            mutationObserver.disconnect()
        }
    }, [])
}
