export const config = [
    {
        label: 'Overview',
        to: '/'
    },
    {
        label: 'Resources',
        items: [
            {
                label: 'Platforms & Services',
                items: [
                    {
                        label: 'Infra',
                        description: 'Centralized authentication infrastructure',
                        to: '/r/infra'
                    },
                    {
                        label: 'Accounts',
                        description: 'Centralized user accounts',
                        to: '/r/accounts'
                    }
                ]
            },
            {
                label: 'Organizations',
                items: [
                    {
                        label: 'Pherus health',
                        description: 'Holistic health care services',
                        to: '/r/pherus-health'
                    },
                    {
                        label: 'Pherus space & robotics',
                        description: 'Space exploration and robotics development',
                        to: '/r/pherus-space'
                    },
                    {
                        label: 'Transspace',
                        description: 'Queer-led resource platform',
                        to: '/r/transspace'
                    }
                ]
            }
        ]
    },
    {
        label: 'FAQ',
        to: '/faq'
    },
    {
        label: 'Blog',
        to: '/blog'
    }
]