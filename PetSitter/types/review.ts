export interface Review {
    reviewId: string
    userId: string
    productId: string
    rating: number
    comment: string
    createdAt: string
    users: {
        userId: string
        fullName: string
        profilePictureUrl: string
    }
}