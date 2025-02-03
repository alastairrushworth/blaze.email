import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="py-16">
      <h1 className="text-5xl font-bold mb-8 text-center text-indigo-800 dark:text-indigo-200">About blaze.email</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Welcome to blaze.email, your premier source for curated weekly tech newsletters. We're passionate about
          keeping you informed on the latest trends, innovations, and insights across various technology domains.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our team of expert curators scours the tech landscape to bring you the most relevant and impactful stories
          each week. Whether you're a developer, entrepreneur, or tech enthusiast, we have a newsletter tailored to your
          interests.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          At blaze.email, we believe in the power of knowledge and the importance of staying ahead in the fast-paced
          world of technology. Our mission is to empower you with the information you need to excel in your field and
          stay informed about the technologies shaping our future.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Join thousands of tech professionals who trust blaze.email for their weekly dose of curated tech insights.
          Choose from our range of specialized newsletters and ignite your tech knowledge today!
        </p>
      </div>
      <div className="text-center">
        <Link
          href="/"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

